import '../../../../less/global/global.less';
import '../../../../less/global/form.less';
import './add.less';

import React from 'react';
import ReactDOM from 'react-dom';
import querystring from 'querystring';
import ResPicker from './../../res-picker/';
import Loading from  '../../../loading/';
import Poptip from  '../../../poptip/';
import AH from '../../../helper/ajax';
import $ from '../../../helper/z';
import {
  Comment
} from '../../model/';

const COMMENT_ERR = {
  1: '参数有误',
  3: '话题ID有误',
  4: '帖子ID有误' ,
  5: '发布内容不能为空',
  7: '用户ID有误或被评论帖子不存在',
  8: '发布评论失败',
  9: '发布评论失败'
}

export default class CommentAdd extends React.Component {
  constructor() {
    super();

    let query = querystring.parse(location.search.substring(1));

    this.state = {
      text: '',
      maxCommentLen: 500,
      qs: query,
      localUser: JSON.parse(localStorage.getItem('user'))
    }
  }

  componentDidMount() {
    this.ah = new AH(this.refs.loading, this.refs.poptip);
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

  submit(e: Object) {
    e.preventDefault();
    e.stopPropagation();

    if (this.state.uploading) {
      return;
    }

    if ($.trim(this.state.text) === '') {
      this.refs.poptip.warn(COMMENT_ERR[5]);

      return;
    }

    this.setState({
      uploading: true
    });

    this.uploadImage((media_ids) => {
      this.ah.one(Comment, {
        success: (data) => {
          if (data !== 0) {
            this.refs.poptip.warn(COMMENT_ERR[data] || '发布评论失败');

            this.setState({
              uploading: false
            });

            return;
          }

          this.refs.poptip.success('发布成功');

          setTimeout(() => {
            history.back();
          }, 1500)
        },
        error: () => {
          this.setState({
            uploading: false
          });

          this.refs.poptip.warn('发布失败');
        }
      }, {
        token: this.state.localUser && this.state.localUser.token || null,
        uid: this.state.qs.uid,
        pid: this.state.qs.pid,
        id: this.state.qs.fid,
        content: this.state.text,
        tid: this.state.qs.tid || 1,
        media_ids: media_ids,
        commend_type: this.state.qs.commend_type
      });
    });
  }

  handleCommentChange(e: Object) {
    let val = e.target.value;

    if (val.length > this.state.maxCommentLen) {
      val = val.substring(0, this.state.maxCommentLen);
    }

    this.setState({
      text: val
    });
  }

  handlePickRes(res: Object) {
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

  closeResPicker() {
    this.switchResMenu(this.state.resMenu);
  }

  render() {
    return (
      <section className="comment-add">
        <form className="form" onSubmit={this.submit.bind(this)}>
          <div className="control">
            <textarea
              className="comment-text"
              placeholder="这里输入评论"
              value={this.state.text}
              onChange={this.handleCommentChange.bind(this)}
              onFocus={this.closeResPicker.bind(this)}
              ></textarea>
            <span className="char-count">{this.state.text.length}/{this.state.maxCommentLen}</span>
          </div>
          <div className="control publish">
            <button className="btn teal">发布</button>
          </div>
          <div className="footer fixed">
            <ResPicker
              menus={['emoj', 'photo']}
              maxPhotoCount={3}
              photos={this.state.photo}
              onPick={this.handlePickRes.bind(this)}
              on={this.state.resMenu}
              onDelEmoj={this.delEmoj.bind(this)}
              onSwitch={this.switchResMenu.bind(this)}
            />
          </div>
        </form>
        <Loading ref='loading' />
        <Poptip ref='poptip' />
      </section>
    )
  }
}

ReactDOM.render(<CommentAdd />, document.querySelector('.page'));
