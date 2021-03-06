import querystring from 'querystring';
import assign from 'lodash/object/assign';
import {POST_OPT, GET_OPT} from '../../const/fetch';

export var PkgSearch = (params) => {
  let qs = querystring.stringify(params);
  return fetch(`/mvc/searchProductsForH5?${qs}`, GET_OPT);
}

export var MyPkgSearch = (params) => {
  let qs = querystring.stringify(params);
  return fetch(`/mvc/searchMyProductsForH5?${qs}`, GET_OPT);
}

export var FollowUser = (uid: String) => {
  return fetch(`/mvc/followForBBS_${uid}`, GET_OPT);
}

export var RePubPkg = (pid) => {
  return fetch('/mvc/product_refresh_json', assign({
    body: querystring.stringify({
      productID: pid
    })
  }, POST_OPT));
}

export var DelPkg = (pid) => {
  return fetch('/mvc/product_disable_batch_forH5', assign({
    body: querystring.stringify({
      productIDs: pid
    })
  }, POST_OPT));
}

export var PubPkg = (params) => {
  return fetch('/mvc/product_addNew_json', assign({
    body: querystring.stringify(params)
  }, POST_OPT));
}

export var PkgMemo = () => {
  return fetch('/mvc/v2/getProductMemo', GET_OPT);
}

export var TodayRecommendPkgs = (params) => {
  let qs = querystring.stringify(params);
  return fetch(`/mvc/todayRecommendProductsForH5?${qs}`, GET_OPT);
}

export var Maluation = (params) => {
  return fetch('/mvc/v2/saveComment', assign({
    body: querystring.stringify(params)
  }, POST_OPT));
}

export var MaluationOfPkg = (params) => {
  let qs = querystring.stringify(params);
  return fetch(`/mvc/v2/commentCount?${qs}`, GET_OPT);
}

export var CommonPkgs = (params) => {
  let qs = querystring.stringify(params);
  return fetch(`/mvc/cargo?${qs}`, GET_OPT);
}

export var DangerousPkgs = (params) => {
  let qs = querystring.stringify(params);
  return fetch(`/mvc/dangerousCargo?${qs}`, GET_OPT);
}

export var LargePkgs = (params) => {
  let qs = querystring.stringify(params);
  return fetch(`/mvc/largeCargo?${qs}`, GET_OPT);
}

export var RefrigerationPkgs = (params) => {
  let qs = querystring.stringify(params);
  return fetch(`/mvc/reeferCargo?${qs}`, GET_OPT);
}

export var ReportTypeEnums = () => {
  return fetch(`/mvc/praise_report/getPraiseType`, GET_OPT);
}

export var SubmitReport = (params) => {
  return fetch(`/mvc/praise_report/add`, assign({
    body: querystring.stringify(params)
  }, POST_OPT));
}

export var PkgDetail = (id) => {
  let qs = querystring.stringify({
    id: id
  });

  return fetch(`/mvc/wx/getSingleProduct?${qs}`, GET_OPT);
}
