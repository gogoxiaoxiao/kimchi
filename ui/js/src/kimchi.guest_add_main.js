/*
 * Project Kimchi
 *
 * Copyright IBM Corp, 2013-2016
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
kimchi.guest_add_main = function() {
    var showTemplates = function() {
        wok.topic('templateCreated').unsubscribe(showTemplates);
        kimchi.listTemplates(function(result) {
            if (result && result.length) {
                $('#prompt-create-template').addClass('hidden');
                $('#prompt-choose-template').removeClass('hidden');
                $('#guest-add-window .guest-pager').animate({
                            height: "530px"
                });

                var html = '';
                var tmpl = $('#tmpl-template').html();
                $.each(result, function(index, value) {
                    value.invalid_indicator = "invalid";
                    if ($.isEmptyObject(value.invalid)) {
                        value.invalid_indicator = "valid";
                    }
                    html += wok.substitute(tmpl, value);
                });
                $('#templateTile').html(html);
                $('.iso-radio-hidden[data-invalid="invalid"]').attr("disabled", true);
                $('.template-status[data-invalid="valid"]').hide();
                $('[data-toggle="tooltip"]').tooltip();
                return;
            }

            $('#btn-create-template').on('click', function(event) {
                wok.topic('templateCreated').subscribe(showTemplates);

                wok.window.open('plugins/kimchi/template-add.html','extendCreateTemplate');

                event.preventDefault();
            });

            $('#prompt-choose-template').addClass('hidden');
            $('#prompt-create-template').removeClass('hidden');
            $('#guest-add-window .guest-pager').animate({
                height: "90px"
            });

        }, function(err) {
            wok.message.error(err.responseJSON.reason);
        });
    };

    function validateForm() {
        if (!$('input[name=template]:checked', '#templateTile').val()) {
            return false;
        }
        return true;
    }

    $('#form-vm-add').change(function() {
        if (validateForm()) {
            $('#vm-doAdd').attr('disabled', false);
        }
    });

    var addGuest = function(event) {
        $('#vm-doAdd').attr('disabled', true);
        $('#vm-doAdd').attr('style', 'display:none');
        $('#vm-doAdding').attr('style', 'display');
        var formData = $('#form-vm-add').serializeObject();
        kimchi.createVM(formData, function() {
            kimchi.listVmsAuto();
            wok.window.close();
        }, function(jqXHR, textStatus, errorThrown) {
            $('#vm-doAdd').attr('style', 'display');
            $('#vm-doAdding').attr('style', 'display:none');
            var reason = jqXHR &&
                jqXHR['responseJSON'] &&
                jqXHR['responseJSON']['reason'];
            wok.message.error(reason);
        });

        return false;
    };

    $('#form-vm-add').on('submit', addGuest);
    $('#vm-doAdd').on('click', addGuest);

    showTemplates();
};
