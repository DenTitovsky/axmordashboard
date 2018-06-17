var axdbWidgetClass = function () {
}
axdbWidgetClass.prototype = {
    _zip: '',
    _city: '',
    _widget: null,
    _geographyContainer: null,
    _weatherImage: null,
    _weatherTemperatureContainer: null,
    _windContainer: null,
    _preasureContainer: null,
    _closer: null,
    _timer: null,

    setOnCloseHandler: function (onCloseHandler) {
        this._closer.click(onCloseHandler);
    },
    setReloadHandler: function (onTimerHandler, reloadInterval) {
        this._timer = setInterval(onTimerHandler, reloadInterval);
    },
    setOnMouseDownHandler: function (onMouseDownHandler) {
        this._geographyContainer.mousedown(onMouseDownHandler);
    },

    init: function (zip, city) {
        this._zip = zip;
        this._city = city;
        this._geographyContainer = $('<td class="axdb-widget-geography" colspan="2">' + city + '</td>');
        this._weatherImage = $('<td class="axdb-widget-weather-image axdb-widget-loading"></td>');
        this._weatherTemperatureContainer = $('<td class="axdb-widget-weather-temperature"></td>');
        this._windContainer = $('<td class="axdb-widget-wind" colspan="2"></td>');
        this._preasureContainer = $('<td class="axdb-widget-preasure" colspan="2"></td>');
        this._closer = $('<td class="axdb-widget-close-cell fa fa-close"></td>');
        this._widget = $('<div class="axdb-widget"></div>')
                        .append($('<table></table>')
                            .append([
                                        $('<tr></tr>').append([this._geographyContainer, this._closer]),
                                        $('<tr></tr>').append([this._weatherImage, this._weatherTemperatureContainer, $('<td rowspan="3"></td>')]),
                                        $('<tr></tr>').append(this._windContainer),
                                        $('<tr></tr>').append(this._preasureContainer)
                                ]));
        return this._widget;
    },
    update: function (data) {
        this._weatherImage.removeClass('axdb-widget-loading').append($('<img src="' + data.PictureURL + '" title="' + data.Description + '" />'));
        this._weatherTemperatureContainer.html(data.Temperature + '° C');
        this._windContainer.html('Ветер: ' + data.Wind + ' meter/sec');
        this._preasureContainer.html('Давление: ' + data.Pressure + ' hPa');
    },
    clear: function(){
        this._weatherImage.addClass('axdb-widget-loading')
        this._weatherImage.html(null);
        this._weatherTemperatureContainer.html(null);
        this._windContainer.html(null);
        this._preasureContainer.html(null);
    },
    showError: function (error) {
        this.clear(); this._weatherImage.removeClass('axdb-widget-loading');
        this._windContainer.html(undefined === error ? 'Ошибка при получении данных' : error);
    },
    getWidget: function () {
        return this._widget;
    },
    getZip: function () {
        return this._zip;
    },
    getCity: function () {
        return this._city;
    },
    stopTimer: function () {
        clearInterval(this._timer);
    }
}