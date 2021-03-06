import React from 'react';

import Comment from './item';

export default class CommentList extends React.Component {
  constructor() {
    super()
  }

  praise(forum: Object) {
    this.props.onPraise(forum);
  }

  comment(forum: Object, type) {
    this.props.onComment(forum, type);
  }

  render() {
    let commentList = this.props.items.map((item, index) => {
      return (
        <Comment
          key={'comment_' + index}
          item={item}
          uid={this.props.uid}
          onPraise={this.praise.bind(this)}
          onComment={this.comment.bind(this)}
          wx_ready={this.props.wx_ready} />
      )
    })

    return (
      <ul className="comment-list">
        {commentList}
      </ul>
    );
  }
}
