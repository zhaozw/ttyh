import '../../../less/global/global.less';
import '../../../less/global/layout.less';
import '../../../less/global/form.less';
import '../../../less/component/icon.less';

import './index.less';

import React from 'react';
import ReactDOM from 'react-dom';
import Promise from 'promise';

import Poptip from '../../poptip/';
import Loading from '../../loading/';
import Selector from '../../selector/';

export default class TruckAddPage extends React.Component {
  constructor() {
    super();

    this.state = {
      truckType: {}
    };
  }

  componentWillMount() {
    let truckTypes = [
      {
        name: '平板',
        id: 1
      }, {
        name: '高栏',
        id: 2
      }, {
        name: '厢式',
        id: 3
      }, {
        name: '面包车',
        id: 4
      }, {
        name: '保温',
        id: 5
      }, {
        name: '冷藏',
        id: 6
      }, {
        name: '危险品',
        id: 7
      }, {
        name: '集装箱',
        id: 8
      }, {
        name: '其他',
        id: 9
      }
    ];

    this.setState({
      truckTypes: truckTypes
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    e.stopPropagation();

    let validate_msg = this.validate();

    if (validate_msg !== true) {
      this.refs.poptip.warn(validate_msg);

      return;
    }

    this.refs.loading.show('请求中...');
    new Promise((resolve, reject) => {
      $.ajax({
        url: '/api/add_truck',
        type: 'POST',
        data: {
          truck_owner: this.state.name,
          tel: this.state.tel,
          license: this.state.license,
          truck_type: this.state.truckType,
          weight: this.state.weight
        },
        success: resolve,
        error: reject
      });
    }).then((res) => {
      this.refs.poptip.success('添加车辆成功');

      history.back();
    }).catch(() => {
      this.refs.poptip.warn('添加车辆失败');
    }).done(() => {
      this.refs.loading.close();
    });
  }

  validate() {
    if ($.trim(this.state.name) === '') {
      return '司机姓名不能为空';
    }

    if ($.trim(this.state.tel) === '') {
      return '手机号不能为空';
    }

    if ($.trim(this.state.license) === '') {
      return '车牌号不能为空';
    }

    if ($.trim(this.state.truckType) === '') {
      return '车型不能为空';
    }

    if ($.trim(this.state.weight) === '') {
      return '载重不能为空';
    }

    return true;
  }

  handleSelectItem(item) {
    this.setState({
      [this.state.selectorField]: item
    });
  }

  showSelector(field, e) {
    this.setState({
      selectorItems: this.state[`${field}s`],
      selectorField: field
    });

    this.refs.selector.show();
  }

  handleNumChange(field: string, e: Object) {
    this.setState({
      [field]: $.trim(e.target.value).replace(/[^\d\.]+/g, '')
    });
  }

  handleTelChange(e: Object) {
    this.setState({
      tel: $.trim(e.target.value).replace(/[^\d]+/g, '')
    });
  }

  handleStrChange(field: string, e: Object) {
    this.setState({
      [field]: $.trim(e.target.value)
    });
  }

  render() {
    return (
      <section className="truck-add-page">
        <form className="form" onSubmit={this.handleSubmit.bind(this)}>
          <div className="field-group">
            <div className="field">
              <label><b>*</b>司机姓名</label>
              <div className="control">
                <input
                  type="text"
                  placeholder="输入司机姓名"
                  value={this.state.name}
                  onChange={this.handleStrChange.bind(this, 'name')}
                />
              </div>
            </div>
            <div className="field">
              <label><b>*</b>手机号</label>
              <div className="control">
                <input
                  type="tel"
                  placeholder="输入手机号码"
                  value={this.state.tel}
                  onChange={this.handleTelChange.bind(this)}
                />
              </div>
            </div>
          </div>
          <div className="field">
            <label><b>*</b>车牌号</label>
            <div className="control">
              <input
                type="text"
                placeholder="输入车牌号"
                value={this.state.license}
                onChange={this.handleStrChange.bind(this, 'license')}
              />
            </div>
          </div>
          <div className="field">
            <label><b>*</b>车型</label>
            <div className="control with-arrow">
              <input
                disabled
                type="text"
                placeholder="选择车型"
                onClick={this.showSelector.bind(this, 'truckType')}
                value={this.state.truckType.name}
              />
              <i className="icon icon-arrow"></i>
            </div>
          </div>
          <div className="field">
            <label><b>*</b>载重</label>
            <div className="control with-unit">
              <input
                type="text"
                placeholder="输入载重"
                value={this.state.weight}
                onChange={this.handleNumChange.bind(this, 'weight')}
              />
              <span className="unit">吨</span>
            </div>
          </div>

          <div className="submit">
            <button type="submit" className="btn block teal">确定</button>
          </div>
        </form>
        <Selector
          ref="selector"
          items={this.state.selectorItems}
          select={this.handleSelectItem.bind(this)} />
        <Loading ref="loading" />
        <Poptip ref="poptip" />
      </section>
    );
  }
}

ReactDOM.render(<TruckAddPage />, $('#page').get(0));
