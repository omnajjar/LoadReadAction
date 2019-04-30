import _widgetBase from "MxWidgetBase";
import declare from "dojoBaseDeclare";
import * as widgetConf from "../conf/widget.config.json";

export default declare(
  `${widgetConf.name}.widget.${widgetConf.name}`,
  [_widgetBase],
  {
    constructor() {},
    postCreate() {
      logger.debug(`${this.id} >> postCreate`);
      this._started = false;
    },
    update(contextObject, callback) {
      logger.debug(`${this.id} >> update`);
      if (!contextObject) {
        callback();
        return;
      }
      this.contextObject = contextObject;
      this.URLParamEntity = contextObject.metaData.getEntity();
      this._start(callback);
      this._execCallback(callback);
    },
    _start(callback) {
      logger.debug(`${this.id} >> _start`);
      this.URLParamKeysActions.forEach(({key, action}) => {
        const URLParamValue = this._getURLParameterByKey(key);
        //create object
        this._createMxObject(this.URLParamEntity)
          .then(URLParamObject => {
            URLParamObject.set(this.ParamKeyAttr, key);
            URLParamObject.set(this.ParamValueAttr, URLParamValue);
            return this._callMicroflow({
              actionName: action,
              guids: [URLParamObject.getGuid()],
            });
          })
          .then(() => this._execCallback(callback))
          .catch(e => {
            //prettier-ignore
            console.error(`Oops! something went wrong either while creating an object of '${this.URLParamEntity}' or while executing microflow '${action}'\n`,e);
            this._execCallback(callback);
          });
      });
    },
    _createMxObject(objName) {
      logger.debug(`${this.id} >> _createMxObject`);
      return new Promise((resolve, reject) => {
        mx.data.create({
          entity: objName,
          callback: resolve,
          error: reject,
        });
      });
    },
    _callMicroflow({
      actionName,
      applyTo = "selection",
      guids,
      xpath,
      constraints,
      sort,
      context,
      origin,
      async,
      onValidation,
    }) {
      const params = {
        actionname: actionName,
        applyto: applyTo,
        guids,
        xpath,
        constraints,
        sort,
      };
      return new Promise((resolve, reject) => {
        mx.data.action({
          params,
          context,
          origin,
          async,
          callback: resolve,
          error: reject,
          onValidation,
        });
      });
    },
    _getURLParameterByKey(_key) {
      const key = _key.replace(/[[\]]/g, "\\$&");
      const url = window.location.href;
      const regex = new RegExp("[?&]" + key + "(=([^&#]*)|&|#|$)");
      const results = regex.exec(url);
      if (!results || !results[2]) return "";
      return decodeURIComponent(results[2].replace(/\+/g, " "));
    },
    _execCallback(cb) {
      if (cb && typeof cb === "function") cb();
    },
  },
);
