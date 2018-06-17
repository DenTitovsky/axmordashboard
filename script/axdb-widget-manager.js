var axdbWidgetManagerClass = function (params) {
    axdbWidgetManagerClass.prototype._panel = params.panel;
}
axdbWidgetManagerClass.prototype = {
    _panel: null,
    _dragging: null,
    _draggingStart: null,
    _draggingRectangle: null,
    _widgets: [],

    init: function () {
        try
        {
            var manager = this;
            var widgets = this._deserializeFromCookies();
            if (widgets) {
                $.each(widgets, function (index, widget) {
                    manager._add(widget.zip, widget.city);
                });
            }
        }
        catch(e) {
            alert('Не удалось восстановить состояние последнего сеанса работы.');
        }

        $(this._panel).on("mousemove", function (e) {
            if (this._dragging) {
                this._dragging.offset({
                    top: e.pageY,
                    left: e.pageX
                });
            }
        });


        $(this._panel).on("mousedown", "div", function (e) {
            this._dragging = $(e.target);
        });

        $(this._panel).on("mouseup", function (e) {
            this._dragging = null;
        });
    },
    add: function (zip, city) {
        if (null != this._getWidgetByZip(zip)) {
            alert('Виджет этого города уже добавлен на панель.');
            return;
        }

        this._add(zip, city);
        this._serializeToCookies();
    },
    remove: function (zip) {
        var widget = this._getWidgetByZip(zip);
        if (null != widget) {
            this._remove(widget);
            this._serializeToCookies();
        }
    },
    refresh: function (widget) {
        $.getJSON('http://api.openweathermap.org/data/2.5/weather?appid=05e91536a9197900dec0d6bf26e3ba76&units=metric&id=' + widget.getZip(), function (response) {
            if (response && response.id && response.id == widget.getZip()) {
                var weather = {
                    Zip: response.id,
                    State: response.sys.country,
                    City: response.name,
                    Description: response.weather[0].main + ', ' + response.weather[0].description,
                    Temperature: response.main.temp,
                    Wind: response.wind.speed,
                    Pressure: response.main.pressure,
                    PictureURL: 'http://openweathermap.org/img/w/' + response.weather[0].icon + '.png'
                };
                widget.update(weather);
            } else
                widget.showError('Empty server response');
        });
    },

    _add: function(zip, city) {
        var widget = new axdbWidgetClass();
        this._panel.append(widget.init(zip, city));

        widget.setOnCloseHandler(function (manager) {
            return function () {
                manager.remove(zip);
            }
        }(this));
        widget.setReloadHandler(function (manager, widget) {
            return function (e) {
                widget.clear();
                manager.refresh(widget);
            }
        }(this, widget), 300000);
        widget.setOnMouseDownHandler(function (manager, widget) {
            return function (e) {
                manager._dragging = widget.getWidget();
                var position = widget.getWidget().position();
                manager._draggingStart = position;
                manager._draggingRectangle = $('<div class="axdb-widget-dragging"></>').css({ top: position.top, left: position.left });
                manager._draggingRectangle.mouseup(function (e) {
                    manager._draggingRectangle.remove();
                    var target = manager._getWidgetByPoint({ X: e.clientX, Y: e.clientY });
                    if (target) {
                        manager._dragging.insertBefore(target.getWidget());
                    }
                    manager._dragging = null;
                });
                manager._draggingRectangle.mousemove(function (e) {
                    var position = widget.getWidget().position();
                    manager._draggingRectangle.css({ top: manager._draggingStart.top + (e.clientY - manager._draggingStart.top) - 20, left: manager._draggingStart.left + (e.clientX - manager._draggingStart.left) - 20 });
                });
                manager._panel.append(manager._draggingRectangle);
            }
        }(this, widget));

        this.refresh(widget);
        this._widgets.push(widget);
    },
    _remove: function(widget) {
        widget.stopTimer();
        widget.getWidget().remove();
        var indexOfWidget = this._widgets.indexOf(widget);
        if (-1 != indexOfWidget) {
            this._widgets.splice(indexOfWidget, 1);
        }
    },
    _getWidgetByZip: function (zip) {
        var result = null;
        $.each(this._widgets, function (index, widget) {
            if (widget.getZip() == zip) {
                result = widget;
                return;
            }
        });
        return result;
    },
    _getWidgetByPoint: function (point) {
        var result = null;
        $.each(this._widgets, function (index, widget) {
            var widgetElement = widget.getWidget();
            var widgetElementPosition = widgetElement.offset();
            if ((widgetElementPosition.left <= point.X && (widgetElementPosition.left + widgetElement.width()) > point.X) &&
                 (widgetElementPosition.top <= point.Y && (widgetElementPosition.top + widgetElement.height()) > point.Y)) {
                result = widget;
                return;
            }
        });
        return result;
    },
    _serializeToCookies: function () {
        var zipCodesList = [];
        $.each(this._widgets, function (index, widget) {
            zipCodesList.push({ zip: widget.getZip(), city: widget.getCity() });
        });
        var expirationDate = (new Date(new Date().getTime() + 60 * 60 * 1000)).toUTCString();
        document.cookie = 'axdb-control=' + JSON.stringify(zipCodesList) + '; expires=' + expirationDate;
    },
    _deserializeFromCookies: function () {
        var result = '';
        try {
            var cookies = document.cookie.split(';');
            $.each(cookies, function (index, cookie) {
                if (0 == cookie.indexOf('axdb-control')) {
                    result = JSON.parse(cookie.split('=')[1]);
                }
            });
        } catch(e) {}
        return result;
    }
}