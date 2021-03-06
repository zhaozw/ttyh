import '../../../less/global/global.less';
import '../../../less/global/form.less';
import './add.less';

import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import ResPicker from '../res-picker/';
import Loading from '../../loading/';
import Poptip from '../../poptip/';
import querystring from 'querystring';
import AH from '../../helper/ajax';
import $ from '../../helper/z';
import {
  BaiduGeo,
  PubForum
} from '../model/';

const SUBMIT_CODE_MSG_MAP = {
  0: '成功',
  1: '参数有误',
  3: 'title 为空',
  5: 'content 为空',
  7: 'uid 有误',
  9: '添加失败'
};

let lStorage = localStorage || {
  setItem() {},
  getItem() {},
  removeItem() {}
};

export default class PostAdd extends React.Component {
  constructor() {
    super();

    let query = querystring.parse(location.search.substring(1));

    this.state = {
      title: '',
      text: '',
      maxTitleLen: 20,
      maxTextLen: 2000,
      address: {},
      qs: query,
      resMenu: 'topic',
      localUser: JSON.parse(lStorage.getItem('user') || "{}")
    }
  }

  componentDidMount() {
    this.ah = new AH(this.refs.loading, this.refs.poptip);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        this.ah.one(BaiduGeo, (data) => {
          this.setState({
            address: {
              city: data.result.addressComponent.city,
              area: data.result.addressComponent.district
            }
          })
        }, {
          ak: '50b9214f70f98c0315913018ba25b420',
          location: `${pos.coords.latitude},${pos.coords.longitude}`,
          output: 'json'
        });
      });
    }
  }

  uploadImage(cb) {
    if (!this.state.photo || !this.state.photo.length) {
      return cb();
    }

    let media_ids = [];

    let len = this.state.photo.length;
    let fn = (i) => {
      let item = this.state.photo[i];

      wx.uploadImage({
        localId: item.url,
        success: (res) => {
          media_ids.push(res.serverId);

          // 上传完成
          if (i === len - 1) {
            return cb(media_ids.join());
          }

          fn(++i);
        }
      });
    }

    fn(0);
  }

  validate() {
    if ($.trim(this.state.title) === '') {
      this.refs.poptip.warn('标题不能为空');

      return false;
    }

    if ($.trim(this.state.text) === '') {
      this.refs.poptip.warn('内容不能为空');

      return false;
    }

    return true;
  }

  submit(e) {
    e.preventDefault();
    e.stopPropagation();

    if (this.state.uploading) {
      return;
    }

    if (!this.validate()) {
      return;
    }

    this.setState({
      uploading: true
    });

    this.uploadImage((media_ids) => {
      let addr;

      if (this.state.showAddress) {
        if (this.state.address.city && this.state.address.area) {
          addr = this.state.address.city + this.state.address.area;
        }
      }

      let data = {
        uid: this.state.qs.uid,
        token: this.state.qs.token || this.state.localUser && this.state.localUser.token || null,
        title: this.state.title,
        content: this.state.text,
        addr: addr,
        tid: this.state.topic && this.state.topic.id || null,
        media_ids: media_ids
      };

      this.ah.one(PubForum, {
        success: (data) => {
          if (data === 0) {
            this.refs.poptip.success('发布成功');

            setTimeout(() => {
              history.back();
            }, 1500);
          } else {
            this.refs.poptip.warn(SUBMIT_CODE_MSG_MAP[data] || '发布失败');

            this.setState({
              uploading: false
            });
          }
        },
        error: () => {
          this.setState({
            uploading: false
          });

          this.refs.poptip.warn('发布失败');
        }
      }, data);
    });
  }

  handleTitleChange(e) {
    let val = e.target.value;

    if (val.length > this.state.maxTitleLen) {
      val = val.substring(0, this.state.maxTitleLen);
    }

    this.setState({
      title: val
    })
  }

  handleTextChange(e) {
    let val = e.target.value;

    if (val.length > this.state.maxTextLen) {
      val = val.substring(0, this.state.maxTextLen);
    }

    this.setState({
      text: val
    });
  }

  handlePickRes(res) {
    if (!res.emoj) {
      return this.setState(res);
    }

    this.setState({
      lastEmoj: res.emoj,
      text: this.state.text + res.emoj
    })
  }

  delEmoj() {
    let text = this.state.text;
    let lastEmoj = this.state.lastEmoj;

    // 最后不是表情
    if (!lastEmoj) {
      return;
    }

    let len = lastEmoj.length;
    let newText = text.substr(0, text.length - len);
    let m = newText.match(/\[\/f[0-9]+\]$/);
    lastEmoj = m && m.length ? m[0] : null;

    this.setState({
      lastEmoj: lastEmoj,
      text: newText
    });
  }

  closeResPicker() {
    this.switchResMenu(this.state.resMenu);
  }

  delTopic() {
    this.setState({
      topic: null
    });
  }

  toggleAddress() {
    this.setState({
      showAddress: !this.state.showAddress
    });
  }

  switchResMenu(menu: string) {
    if (menu === this.state.resMenu) {
      this.setState({
        resMenu: null
      });

      return;
    }

    this.setState({
      resMenu: menu
    });
  }

  render() {
    let topic;

    topic = this.state.topic
      ? (
        <div className="action-tag" onClick={this.delTopic.bind(this)}>
          <i className="icon icon-card"></i>
          <span>{this.state.topic.name}</span>
          <i className="icon icon-minus round yellow action-icon"></i>
        </div>
      )
      : '';

    let addressDescription = this.state.showAddress ? `${this.state.address.city || ''} ${this.state.address.area || ''}` : '显示位置';
    let addressActionIconClasses = classNames('icon round action-icon', this.state.showAddress ? 'icon-minus yellow' : 'icon-plus teal');

    return (
      <section className="post-add">
        <form className="form" onSubmit={this.submit.bind(this)}>
          <div className="control post-title">
            <input
              type="text"
              placeholder="标题"
              value={this.state.title}
              onChange={this.handleTitleChange.bind(this)}
              onFocus={this.closeResPicker.bind(this)}
            />
            <span className="char-count">{this.state.title.length}/20</span>
          </div>
          <div className="post-body">
            <div className="control">
              <textarea
                className="post-text"
                placeholder="正文"
                value={this.state.text}
                onChange={this.handleTextChange.bind(this)}
                onFocus={this.closeResPicker.bind(this)}
              ></textarea>
              <span className="char-count">{this.state.text.length}/2000</span>
            </div>
            <div className="control publish">
              <button className="btn teal">发布</button>
            </div>
          </div>
          <section className="footer fixed">
            <ul className="row picked-tag">
              <li className="topic-tag">
              {topic}
              </li>
              <li className="location-tag">
                <div className="action-tag" onClick={this.toggleAddress.bind(this)}>
                  <i className="icon icon-address s20"></i>
                  <span>{addressDescription}</span>
                  <i className={addressActionIconClasses}></i>
                </div>
              </li>
            </ul>
            <ResPicker
              menus={['topic', 'emoj', 'photo']}
              maxPhotoCount={9}
              photos={this.state.photo}
              onPick={this.handlePickRes.bind(this)}
              on={this.state.resMenu}
              onDelEmoj={this.delEmoj.bind(this)}
              onSwitch={this.switchResMenu.bind(this)}
            />
          </section>
        </form>
        <Loading ref="loading" />
        <Poptip ref="poptip" />
      </section>
    )
  }
}

ReactDOM.render(<PostAdd />, document.querySelector('.page'));
