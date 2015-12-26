import './index.less';

import React from 'react';

export default class TopicPicker extends React.Component {
  constructor() {
    super();

    this.state = {
      topics: []
    };
  }

  componentDidMount() {
    $.ajax({
      url: '/api/bbs/all_topic',
      type: 'GET',
      cache: false,
      success: (data) => {
        this.setState({
          topics: data.bbsTopicList
        });
      }
    })
  }

  pick(topic: Object, e: Object) {
    e.preventDefault();
    e.stopPropagation();

    this.props.onPick(topic);
  }

  render() {
    let topics = [];

    this.state.topics.forEach((item) => {
      if (item.id != 1) {
        topics.push(item);
      }
    });

    let topicList = topics.map((topic, index) => {
      return (
        <a
          href="#"
          key={'topic-item_' + index}
          onClick={this.pick.bind(this, topic)}>{topic.name}</a>
      )
    });

    return (
      <div className="topic-list">
        {topicList}
      </div>
    )
  }
}
