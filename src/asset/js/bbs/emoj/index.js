import './index.less';

import React from 'react';
import emojPNG from '../../../img/qq/emoj.png';

export default class Emoj extends React.Component {
  static code_reg() {
    return /\[\/f(\d+)\]/g;
  }

  static BR_TAG_REG = /\n/g;

  static count = 0;

  constructor() {
    super();

    this.state = {
      emojIconSize: 24,
      emojIconPadding: 10,
      emojCountPerLine: 6
    };
  }

  static formatText(text: string) {
    let cnt = text;

    if ($.trim(cnt) === '') {
      return;
    }

    let m = cnt.match(Emoj.code_reg());

    if (!m) {
      return <span>{Emoj.replaceLineBreak(cnt)}</span>;
    }

    let r = [];

    m.forEach((s, i) => {
      let si = cnt.indexOf(s);

      let code = parseInt(s.match(/\d+/)[0], 10);

      if (si === 0) {
        cnt = cnt.substring(s.length);
        r.push(<Emoj key={`emoj-text-item_${++Emoj.count}`} code={code} />)

        return;
      }

      let t = cnt.substring(0, si);
      cnt = cnt.substring(si + s.length);

      r = r.concat(Emoj.replaceLineBreak(t));
      r.push(<Emoj key={`emoj-text-item_${++Emoj.count}`} code={code} />)
    });

    return <span>{r}</span>;
  }

  static replaceLineBreak(text: String) {
    let m = text.match(Emoj.BR_TAG_REG);

    if (!m) {
      return [<span key={`emoj-text-item_${++Emoj.count}`}>{text}</span>];
    }

    let r = [];

    m.forEach((s, i) => {
      let si = text.indexOf(s);

      if (si === 0) {
        text = text.substring(s.length);
        r.push(<br key={`emoj-text-item_${++Emoj.count}`} />);
        return;
      }

      let t = text.substring(0, si);
      text = text.substring(si + s.length);

      r.push(<span key={`emoj-text-item_${++Emoj.count}`}>{t}</span>);
      r.push(<br key={`emoj-text-item_${++Emoj.count}`} />);
    });

    return r;
  }

  pos(code: Number) {
    let _x = code % this.state.emojCountPerLine;
    let _y = Math.floor(code / this.state.emojCountPerLine);

    let x = _x * (this.state.emojIconSize + this.state.emojIconPadding);
    let y = _y * (this.state.emojIconSize + this.state.emojIconPadding);

    return {
      x: -x,
      y: -y
    };
  }

  render() {
    let pos = this.pos(this.props.code);

    let emojStyle = {
      'backgroundImage': `url(${emojPNG})`,
      'backgroundPosition': `${pos.x}px ${pos.y}px`
    }

    return (
      <i className="emoj-icon" style={emojStyle}></i>
    );
  }
}
