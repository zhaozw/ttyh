import '../../../../../../node_modules/slick-carousel/slick/slick.less';
import './index.less';

import React from 'react';
import Slider from 'react-slick';
import Emoj from '../../emoj/';
import delPNG from '../../../../img/qq/del.png';

export default class EmojPicker extends React.Component {
  constructor() {
    super();

    this.state = {
      emojCount: 104,
      emojPageSize: 23
    }
  }

  pick(emoj: Object, e: Object) {
    e.preventDefault();
    e.stopPropagation();

    this.props.onPick(emoj);
  }

  del() {
    this.props.onDel();
  }

  buildEmojList(page: Number): Array<Object> {
    let list = [];
    let i = 0;

    while(i < this.state.emojPageSize) {
      let key = `emoj-item_${page}_${i}`;
      let code = page * 23 + i;

      if (code > 104) {
        break;
      }

      list.push(
        <a
          className="emoj"
          href="#"
          key={key}
          onClick={this.pick.bind(this, `[/f${code}]`)}>
            <Emoj code={code} />
          </a>
      );

      if (i === 22) {
        list.push(
          <a
            className="emoj"
            href="#"
            key={'emoj-item_clear'}
            onClick={this.del.bind(this)}>
            <img src={delPNG} />
          </a>
        )
      }

      i++;
    }

    return list;
  }

  render() {
    const settings = {
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      className: 'emoj-list',
      initialSlide: 0,
      arrows: false,
      centerMode: true
    };

    let emojPageCount = Math.ceil(this.state.emojCount / this.state.emojPageSize);
    let emojPages = [];
    let i = 0;

    while(i < emojPageCount) {
      let list = this.buildEmojList(i);

      emojPages.push(
        <div key={'emoj-list-group_' + i} className="emoj-list-group">{list}</div>
      );

      i++;
    }

    return (
      <div className="emoj-list-wrapper">
        <Slider {...settings}>
          {emojPages}
        </Slider>
      </div>
    )
  }
}
