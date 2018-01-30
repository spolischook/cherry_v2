'use strict';

import $ from 'jquery';

let $subscribeLink = $('#js-subscribe-link'),
    $flashMessagesContainer = $('#flash-messages'),
    InvalidFeedbackTemplate = require('./templates/invalid-feedback.hbs'),
    AlertTemplate = require('./templates/alert.hbs'),
    subscribeAction = function () {
        let lang = $('html').attr('lang'),
            $emailField = $('.subsriber-form .subscriber-email'),
            $button = $('.subsriber-form subscribe-button'),
            email = $emailField.val();

        $emailField.attr('disabled', true);
        $button.attr('disabled', true);

        $.ajax({
            url: '/'+lang+'/subscribe',
            method: 'POST',
            data: email,
            error: function (jqXHR, textStatus, errorThrown) {
                let error = jqXHR.responseJSON.error;
                $emailField.addClass('is-invalid');
                $emailField.parent().find('.invalid-feedback').remove();
                $emailField.parent().append(InvalidFeedbackTemplate({ error: error }));
            },
            success: function (data) {
                $subscribeLink.popover('hide');
                let alertHtml =
                $flashMessagesContainer.append(AlertTemplate({
                    alertType: 'success',
                    message: data
                }));
                $(".alert").fadeTo(2500, 2200).slideUp(300, function() {
                    $(this).remove();
                })
            }
        }).always(() => {
            $emailField.prop('disabled', false);
            $button.prop('disabled', false);
        });
    };

$subscribeLink.popover({
    html : true,
    template: '<div class="popover subsriber-form" role="tooltip">' +
        '<div class="arrow"></div>' +
        '<h3 class="popover-header"></h3>' +
        '<div class="popover-body"></div>' +
    '</div>',
    title: function() {
        return $("#popover-head").html();
    },
    content: function() {
        return $("#popover-content").html();
    }
});

$subscribeLink.on('shown.bs.popover', function () {
    $('.subscribe-button').on('click', subscribeAction);
});
