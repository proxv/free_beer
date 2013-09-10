var Backbone = require('backbone');
var Mustache = require('mustache');
var SearchEvent = require('../../constants/search-event-constants.js');

var regexWhitespace = /\s+/;

var SearchWidget = Backbone.View.extend({
  className: 'search-widget', 
  options: {
    placeholderText: 'Search...',
    debounceInterval: 400,
    minChars: 2,
    extraMatcher: null, // eg: function(model, regex) { return someBoolean; } // besides checking searchFields, does additional, custom check
    extraSearchSource: null, // eg: function(model) { return someTextToSearch;} // callback funtion that provides additional search source
    filterOutModel: undefined   // callback, used to filter out a model before user input is considered. (added to ignore shopping carts when searching requisitions)
  },

  initialize: function(args) {
    if (!args.collection || !args.searchFields) {
      throw new Error('searchFields and collection params required');
    }
    this.collection = args.collection;
    this.$el.append(Mustache.render($('#template-widget-search').html()));
    this.$el.addClass('search-widget');
    var input = this.input = this.$('input');
    input.attr('placeholder', this.options.placeholderText);
    input.inputPlaceholder();

    this.clearSearch = this.$('.clear-search');
    this._setupKeyup();
    this._setupClearButton();
  },

  _setupKeyup: function() {
    var itself = this;
    var doSearch = _.debounce(function() {
      var val = itself.input.val();
      if (val && val === itself.options.placeholderText) {
        return;
      }
      if (val.length < itself.options.minChars) {
        itself.collection.trigger(SearchEvent.ClearSearch);
        itself.clearSearch.toggleClass('disabled', val.length === 0);
        itself._searchComplete();
      } else {
        var regexes = _(val.split(regexWhitespace)).map(function(key) {
          key = key.replace(/[-[\]{}()+.,\\^$|#\s]/g, '\\$&').replace(/[?*]/, '[\\s\\S]$&');
          if (key.indexOf('*') > -1) {
            key = '\\b' + key + '\\b';
          }
          return new RegExp(key, 'i');
        });
        itself._doSearch(regexes);
      }
    }, itself.options.debounceInterval);
    itself.input
      .keyup(doSearch)
      .bind('paste', function() {
        setTimeout(doSearch, 0);
      });
  },

  _setupClearButton: function() {
    var itself = this;
    var button = itself.clearSearch;
    button.click(function(evt) {
      if (button.hasClass('disabled')) {
        return;
      }
      itself.clearSearch.addClass('disabled');
      itself.collection.trigger(SearchEvent.ClearSearch);
      itself.input.val('');
      itself._searchComplete();
    });
  },

  _doSearch: function(regexes) {
    var itself = this;
    var collection = itself.collection;
    collection.trigger(SearchEvent.SearchStarted, regexes);
    collection.each(function(model) {
      var isMatch = (itself.options.filterOutModel ? !itself.options.filterOutModel(model) : true) &&
      _(regexes).all(function(regex) {
        return (itself.options.extraSearchSource && regex.test(itself.options.extraSearchSource(model))) ||
          (itself.options.extraMatcher && itself.options.extraMatcher(model, regex)) ||
          _(itself.options.searchFields).any(function(field) {
            var val = model.get(field);
            return val && regex.test(val);
        });
      });
      if (isMatch) {
        model.trigger(SearchEvent.SearchMatch, model);
      }
    });
    itself.clearSearch.removeClass('disabled');
    itself._searchComplete();
  },

  _searchComplete: function() {
    var itself = this;
    itself._done = itself._done || function() {
      var val = $.trim(itself.input.val());
      itself.collection.trigger(SearchEvent.SearchComplete, val);
    };
    itself._done();
  }

});

module.exports = SearchWidget;
