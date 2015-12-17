import '../../../less/global/global.less';
import '../../../less/global/form.less';
import './add.less';

import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import ResPicker from '../res-picker/';
import TipBox from '../tipbox/';
import Loading from '../../loading/';
import Poptip from '../../poptip/';
import querystring from 'querystring';

const SUBMIT_CODE_MSG_MAP = {
  0: '成功',
  1: '参数有误',
  3: 'title 为空',
  5: 'content 为空',
  7: 'uid 有误',
  9: '添加失败'
}

export default class PostAdd extends React.Component {
  constructor() {
    super();

    let query = querystring.parse(location.search.substring(1));

    this.state = {
      title: '',
      text: '',
      maxTitleLen: 20,
      maxTextLen: 2000,
      submited: false,
      address: {},
      qs: query
    }
  }

  componentDidMount() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        $.ajax({
          url: 'http://api.map.baidu.com/geocoder/v2/',
          type: 'GET',
          data: {
            ak: '50b9214f70f98c0315913018ba25b420',
            location: `${pos.coords.latitude},${pos.coords.longitude}`,
            output: 'json'
          },
          dataType: 'jsonp',
          success: (data) => {
            this.setState({
              address: {
                city: data.result.addressComponent.city,
                area: data.result.addressComponent.district
              }
            })
          },
          error: () => {}
        })
      });
    }
  }

  uploadImage(cb) {
    let media_ids = [];

    alert(JSON.stringify(this.state.photo))

    if (this.state.photo && this.state.photo.length) {
      this.refs.loading.show('正在上传图片...');
      this.state.photo.forEach((item) => {
        wx.uploadImage({
          localId: item.url,
          success: (res) => {
            media_ids.push(res.serverId);

            alert(res.serverId);

            if (media_ids.length === this.state.photo.length) {
              cb(media_ids.join());
            }
          }
        });
      });

      return;
    }

    cb();
  }

  submit(e) {
    e.preventDefault();
    e.stopPropagation();

    this.uploadImage((media_ids) => {
      this.refs.loading.show('正在发布...');

      $.ajax({
        url: '/mvc/bbs_v2/post',
        type: 'POST',
        data: {
          uid: this.state.qs.uid,
          token: this.state.qs.token,
          title: this.state.title,
          content: this.state.text,
          addr: this.state.address.city + this.state.address.area,
          tid: this.state.topic && this.state.topic.id || null,
          imgs_url: media_ids
        },
        success: (data) => {
          this.refs.loading.close();

          if (data === 0) {
            this.setState({
              submited: true,
              submitOk: true,
              submitMsg: '发布成功'
            });
          } else {
            this.setState({
              submited: true,
              submitOk: false,
              submitMsg: SUBMIT_CODE_MSG_MAP[data]
            });
          }
        },
        error: () => {
          this.refs.loading.close();

          this.setState({
            submited: true,
            submitOk: false,
            submitMsg: '发布失败'
          });
        }
      });
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

  handleTipBoxClosed() {
    if (this.state.submitOk) {
      location.href = location.protocol + '//' + location.host + location.pathname.replace(/\/[^\/]+$/, '/bbs.html');

      return;
    }

    this.setState({
      submited: false
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

    let addressDescription = this.state.showAddress ? (this.state.address.city + ' ' + this.state.address.area) : '显示位置';
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
            <ul className="grid picked-tag">
              <li className="topic-tag">
              {topic}
              </li>
              <li className="location-tag">
                <div className="action-tag" onClick={this.toggleAddress.bind(this)}>
                  <i className="icon icon-address"></i>
                  <span>{addressDescription}</span>
                  <i className={addressActionIconClasses}></i>
                </div>
              </li>
            </ul>
            <ResPicker
              menus={['topic', 'emoj', 'photo']}
              onPick={this.handlePickRes.bind(this)}
              on={this.state.resMenu}
              onDelEmoj={this.delEmoj.bind(this)}
              onSwitch={this.switchResMenu.bind(this)}
            />
          </section>
        </form>
        {
          (() => {
            if (this.state.submited) {
              return <TipBox msg={this.state.submitMsg} ok={this.state.submitOk} onClose={this.handleTipBoxClosed.bind(this)} />
            }
          })()
        }
        <Loading ref="loading" />
        <Poptip ref="poptip" />
      </section>
    )
  }
}

ReactDOM.render(<PostAdd />, $('#page').get(0));
