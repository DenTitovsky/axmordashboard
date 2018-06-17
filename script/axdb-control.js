var axdbControlClass = function () { }
axdbControlClass.prototype = {
    _widgetsPanel: null,
    _widgetsManager: null,
    _citySelectDropDown: null,
    init: function (container, cityCodes) {
        this._widgetsPanel = $('<td></td>');
        this._widgetsManager = new axdbWidgetManagerClass({ panel: this._widgetsPanel });

        var citySelectDropDown = $('<select id="axdb-city-select-ctrl" width="100"></select>');
        var cityAddButton = $('<input id="axdb-add-city-button-ctrl" type="button" value="Добавить"/>');
        var cityControls = $('<td></td>').append([
                                $('<div>Выберите город</div>'),
                                $('<div></div>').append(citySelectDropDown),
                                $('<div></div>').append(cityAddButton)]);
        var table = $('<table class="axdb-matrix" width="100%"></table>').append([
                            $('<tr class="axdb-manage-panel"></tr>').append(cityControls),
                            $('<tr class="axdb-widget-panel"></tr>').append(this._widgetsPanel)]);
        $(container).addClass('axdb-main-container').append(table);

        $('#axdb-city-select-ctrl').append($('<option>', { text: 'Выберите город', value: '' }));
        $.each(cityCodes, function (index, entity) {
            $('#axdb-city-select-ctrl').append($('<option>', { text: entity.name, value: entity.id }));
        });
        this._citySelectDropDown = citySelectDropDown;

        $('#axdb-add-city-button-ctrl').click(function (control) {
            return function () {
                var selectedZipCode = control._citySelectDropDown.children('option:selected').val();
                var selectedCityName = control._citySelectDropDown.children('option:selected').text();
                if ('' == selectedZipCode) {
                    alert('Выберите город из списка!');
                } else
                    control._widgetsManager.add(selectedZipCode, selectedCityName);
            }
        }(this));

        this._widgetsManager.init();
    }
}