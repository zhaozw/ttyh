/**
 * 发布车源页面
 *
 * @author Kane xiaoyunhua@ttyhuo.cn
 */
import '../../../less/global/global.less';
import '../../../less/global/layout.less';
import '../../../less/global/form.less';
import '../../../less/component/icon.less';
import './index.less';

import React from 'react';
import ReactDOM from 'react-dom';
import querystring from 'querystring';
import cx from 'classnames';
import Promise from 'promise';

import Log from '../../log/';
import Poptip from '../../poptip/';
import Loading from '../../loading/';
import CitySelector from '../../city-selector/';

const TRUCK_PUB = 'truck-pub';
const DEFAULT_TRUCK = 'default-truck';
const PAGE_TYPE = 'trucker_page';

export default class TruckPubPage extends React.Component {

  state = $.extend({
    qs: querystring.parse(location.search.substring(1)),
    memoMaxLength: 80,
    memo: '',
    fromCities: [],
    toCities: [],
    selectedTruckTag: {},
    truck: JSON.parse(localStorage.getItem(DEFAULT_TRUCK)),
  }, JSON.parse(localStorage.getItem(TRUCK_PUB)) || {});

  constructor() {
    super();
  }

  /**
   * 获取车辆标签列表
   */
  fetchTruckTagList() {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: '/mvc/v2/getTruckTag',
        type: 'GET',
        success: resolve,
        error: reject
      });
    }).then((res) => {
      delete res.truckTagList['0'];

      let truckTagListKeys = Object.keys(res.truckTagList);
      let truckTagList = truckTagListKeys.map((key) => {
        return {
          name: res.truckTagList[key],
          id: key
        };
      });

      return truckTagList;
    });
  }

  componentWillMount() {
    this
      .fetchTruckTagList()
      .then((truckTagList) => {
        this.setState({
          truckTags: truckTagList
        });
      })
      .catch((...args) => {
        Log.error(args[0]);

        this.refs.poptip.warn('获取车辆标签失败,请重试');
      });
  }

  /**
   * 转换为服务端需要的数据格式
   * @param  {Object} data 需要转换的数据
   * @return {Object} 转换后的数据
   */
  format(data) {
    let fromCities = data.fromCities;
    let fromCitiesLen = fromCities.length;

    if (fromCitiesLen > 0 && !fromCities[fromCitiesLen - 1]) {
      fromCities.splice(fromCitiesLen - 1, 1);
    }

    let toCities = data.toCities;
    let toCitiesLen = toCities.length;

    if (toCitiesLen > 0 && !toCities[toCitiesLen - 1]) {
      toCities.splice(toCitiesLen - 1, 1);
    }

    data.fromCities = fromCities.join().replace('-', ' ');
    data.toCities = toCities.join().replace('-', ' ');

    return data;
  }

  /**
   * 表单字段校验
   * @param  {Object} data 需要校验的数据
   * @return {Mix} 校验通过返回 true, 不通过返回提示信息
   */
  validate(data) {
    if (!data.fromCities || !data.fromCities.length || !data.fromCities[0]) {
      return '出发地址不能为空';
    }

    if (!data.toCities || !data.toCities.length || !data.toCities[0]) {
      return '到达地址不能为空';
    }

    if (!data.truckID) {
      return '请选择车辆';
    }

    return true;
  }

  /**
   * 车源发布提交
   * @param  {ClickEvent} e
   */
  handleSubmit(e) {
    e.preventDefault();
    e.stopPropagation();

    let data = {
      truckID: this.state.truck.truckID,
      shuoshuo: this.state.memo,
      fromCities: this.state.fromCities,
      toCities: this.state.toCities,
      truckTag: this.state.selectedTruckTag.id
    };

    let msg = this.validate(data);

    if (msg !== true) {
      this.refs.poptip.warn(msg);

      return;
    }

    data = this.format(data);

    this.refs.loading.show('请求中...');

    new Promise((resolve, reject) => {
      $.ajax({
        url: '/mvc/v2/newDriverShuoShuo',
        type: 'POST',
        data: data,
        success: resolve,
        error: reject
      })
    }).then((res) => {
      if (res.retcode === 0) {
        this.refs.poptip.success('发布车源成功');

        // 清除草稿
        localStorage.removeItem(TRUCK_PUB);

        setTimeout(() => {
          history.back();
        }, 2000);

        return;
      }
    }).catch(() => {
      this.refs.poptip.warn('发布失败,请重试');
    }).done(() => {
      this.refs.loading.close();
    });
  }

  /**
   * 清除地址列表中为空的元素，最后一个元素允许为空
   * @param  {String} field 地址列表字段名
   * @return {Array} 新地址列表
   */
  removeNullAddr(field) {
    let addrs = this.state[field];
    let len = addrs.length;

    addrs = addrs.filter((addr, index) => {
      if (index === len - 1) {
        return true;
      }

      return addr != null;
    });

    return addrs;
  }

  /**
   * 写入车源数据到本地，暂存为草稿
   */
  writeDraft() {
    let fromCities = this.removeNullAddr('fromCities');
    let toCities = this.removeNullAddr('toCities');

    let d = {
      fromCities: fromCities,
      toCities: toCities,
      selectedTruckTag: this.state.selectedTruckTag,
      memo: this.state.memo
    };

    this.setState(d);
    localStorage.setItem(TRUCK_PUB, JSON.stringify(d));
  }

  /**
   * 打开/关闭地址选择器
   * @param  {String} field 地址列表字段名
   * @param  {Number} index 需要打开/关闭的元素索引
   * @param  {ClickEvent} e
   */
  toggleCitySelector(field, index, e) {
    let offset = $(e.target).offset();
    let top = offset.top + offset.height - 1;

    this.setState({
      citySelectorTop: top,
      citySelectorField: field,
      citySelectorIndex: index,
      showCitySelector: !this.state.showCitySelector
    });
  }

  /**
   * 给地址列表中添加一个元素
   * @param {String} field 地址列表字段名
   * @param {ClickEvent} e
   */
  addAddrSelector(field, e) {
    e.preventDefault();
    e.stopPropagation();

    let addrs = this.state[field];
    addrs.push(null);

    this.setState({
      [field]: addrs
    }, () => {
      this.writeDraft();
    });
  }

  /**
   * 删除地址列表中的一个元素
   * @param  {String} field 地址列表字段名
   * @param  {String} addr 待删除的元素
   * @param  {ClickEvent} e
   */
  delAddrSelector(field, addr, e) {
    e.preventDefault();
    e.stopPropagation();

    let addrs = this.state[field];
    let index = addrs.indexOf(addr);

    addrs.splice(index, 1);

    this.setState({
      [field]: addrs
    }, () => {
      this.writeDraft();
    });
  }

  /**
   * 选择省份
   * @param  {String} province 省份值
   */
  handleSelectProvince(province) {
    let field = this.state.citySelectorField;
    let addrs = this.state[field];

    if (province === '不限') {
      province = null;
    }

    addrs[this.state.citySelectorIndex] = province;

    this.setState({
      [field]: addrs
    }, () => {
      this.writeDraft();
    });
  }

  /**
   * 选择城市
   * @param  {String} city 城市值
   */
  handleSelectCity(city) {
    let field = this.state.citySelectorField;
    let index = this.state.citySelectorIndex;
    let addrs = this.state[field];
    let pre = addrs[index];
    addrs[this.state.citySelectorIndex] = `${pre}-${city}`;

    this.setState({
      [field]: addrs
    }, () => {
      this.writeDraft();
    });
  }

  /**
   * 选择地区
   * @param  {String} area 区
   */
  handleSelectArea(area) {
    let field = this.state.citySelectorField;
    let index = this.state.citySelectorIndex;
    let addrs = this.state[field];
    let pre = addrs[index];
    addrs[this.state.citySelectorIndex] = `${pre}-${area}`;

    this.setState({
      [field]: addrs
    }, () => {
      this.writeDraft();
    });
  }

  /**
   * 取消地址选择
   */
  handleCancelCitySelector() {
    this.setState({
      showCitySelector: false
    });
  }

  /**
   * 处理选择历史地址
   * @param  {Array} args [省份, 城市, 地区]
   */
  handleSelectHistory(...args) {
    let field = this.state.citySelectorField;
    let index = this.state.citySelectorIndex;
    let addrs = this.state[field];

    let selected = args.filter((arg) => {
      return !!arg;
    });

    addrs[this.state.citySelectorIndex] = selected.join('-');

    this.setState({
      [field]: addrs
    }, () => {
      this.writeDraft();
    });
  }

  /**
   * 处理备注改变
   * @param  {ChangeEvent} e
   */
  handleMemoChange(e: Object) {
    let val = $.trim(e.target.value);

    if (val.length > this.state.memoMaxLength) {
      val = val.substring(0, this.state.memoMaxLength);
    }

    this.setState({
      memo: val
    }, () => {
      this.writeDraft();
    });
  }

  /**
   * 处理选择车辆标签
   * @param  {Object} truckTag
   * @param  {ChangeEvent} e
   */
  handleTruckTagChange(truckTag, e) {
    this.setState({
      selectedTruckTag: truckTag
    }, () => {
      this.writeDraft();
    });
  }

  /**
   * 展示车辆标记选择列表
   * @return {[type]} [description]
   */
  renderTruckTagList() {
    let truckTags = this.state.truckTags;
    let selectedTruckTag = this.state.selectedTruckTag;

    if (truckTags && truckTags.length) {
      return truckTags.map((truckTag, index) => {
        return (
          <label key={`truck-tag-item_${index}`}>
            <input
              type="radio"
              name="truck-tag"
              value={truckTag.id}
              checked={selectedTruckTag.id === truckTag.id}
              onChange={this.handleTruckTagChange.bind(this, truckTag)}
            />
            {truckTag.name}
          </label>
        )
      });
    }
  }

  /**
   * 展示选中的车辆
   */
  renderSelectedTruck() {
    let truck = this.state.truck;

    if (truck) {
      let truckLength = truck.truckLength != null && parseFloat(truck.truckLength) !== 0 ? `${truck.truckLength}米`: '';
      let loadLimit = truck.loadLimit != null && parseFloat(truck.loadLimit) !== 0 ? `${truck.loadLimit}吨` : '';

      return (
        <a href="./roadtrain.html">
          <h3>{truck.dirverName}</h3>
          <p>{truck.licensePlate} {truck.truckTypeStr} {truckLength} {loadLimit}</p>
          <i className="icon icon-arrow"></i>
        </a>
      );
    }

    return (
      <a href="./roadtrain.html">
        <h3>请选择车辆</h3>
        <i className="icon icon-arrow"></i>
      </a>
    );
  }

  /**
   * 展示地址选择列表
   */
  renderAdrrSelectList(field, listName, labelIcon, placeholder) {
    let addrs = this.state[listName];

    if (!addrs || !addrs.length) {
      addrs = [null]
    }

    let len = addrs.length;

    return addrs.map((addr, index) => {
      let action, icon;

      if (!addr) {
        action = <i className="icon icon-arrow"></i>;
      } else {
        if (len === 1 || index === len - 1) {
          action = <i className="icon s20 icon-add-addr" onClick={this.addAddrSelector.bind(this, listName)}></i>;
        } else {
          action = <i className="icon s20 icon-del-addr" onClick={this.delAddrSelector.bind(this, listName, addr)}></i>
        }
      }

      if (index === 0) {
        icon = <i className={cx('icon s20', labelIcon)}></i>;
      }

      return (
        <div className="field" key={`addr-selector-item_${field}_${index}`}>
          <label>{icon}</label>
          <div
            className="control"
            onClick={this.toggleCitySelector.bind(this, listName, index)}>
            <input
              type="text"
              disabled="disabled"
              placeholder={placeholder}
              value={addr} />
            {action}
          </div>
        </div>
      )
    });
  }

  render() {
    return (
      <section className="truck-pub">
        <div className="row biz-types">
          {this.renderTruckTagList()}
        </div>
        <h2 className="subtitle"><b>*</b>路线</h2>
        <div className="field-group">
          {this.renderAdrrSelectList('fromCity', 'fromCities', 'icon-start-point', '请选择出发地址')}
          {this.renderAdrrSelectList('toCity', 'toCities', 'icon-end-point', '请选择到达地址')}
        </div>
        <h2 className="subtitle"><b>*</b>选择车辆</h2>
        <ul className="truck-list">
          <li>{this.renderSelectedTruck()}</li>
        </ul>
        <h2 className="subtitle"><b>*</b>备注</h2>
        <div className="field-group">
          <div className="field memo">
            <label><i className="icon icon-memo s20"></i></label>
            <div className="control">
              <textarea
                placeholder="备注"
                value={this.state.memo}
                onChange={this.handleMemoChange.bind(this)}
              ></textarea>
              <span className="char-count">{this.state.memo.length}/{this.state.memoMaxLength}</span>
            </div>
          </div>
        </div>
        <button
          className="btn block teal pub-btn"
          type="submit"
          onClick={this.handleSubmit.bind(this)}
        >发布</button>
        <div className="fixed-holder"></div>
        <Loading ref="loading" />
        <Poptip ref="poptip" />
        <CitySelector
          on={this.state.showCitySelector}
          top={this.state.citySelectorTop}
          prefix={PAGE_TYPE}
          onSelectProvince={this.handleSelectProvince.bind(this)}
          onSelectCity={this.handleSelectCity.bind(this)}
          onSelectArea={this.handleSelectArea.bind(this)}
          onSelectHistory={this.handleSelectHistory.bind(this)}
          onCancel={this.handleCancelCitySelector.bind(this)}
        />
      </section>
    );
  }
}

ReactDOM.render(<TruckPubPage />, $('#page').get(0));
