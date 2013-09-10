window.Warehouse.BaseView = Backbone.View.extend({
  viewKey: null, // to override

  appendTemplate: function(data) {
    this.$el.append(this._evaluateMustache(data));
  },

  setTemplate: function(data) {
    this.setElement(this._evaluateMustache(data));
  },

  _getTemplateContent: function() {
    var viewKey = this.options.viewkey || this.viewKey;
    if (!viewKey) {
      throw new Error('viewKey must be set');
    }
    var templateKey = '#mustache-' + this.viewKey.replace(/\//g, '-');
    var res = $(templateKey).html();
    if (!res || !res.length) {
      throw new Error('template missing: ' + templateKey);
    }
    return res;
  },

  _evaluateMustache: function(data) {
    data = data || {};
    return $.trim(Mustache.render(this._getTemplateContent(), data));
  }
});
