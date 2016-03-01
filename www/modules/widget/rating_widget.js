/*
 * params.container                   jQuery selector (e.g., '#foo' or '.foo') of div container for the widget
 * params.restaurantId                Restaurant ID as stored in iReview system
 * params.width                       widget's css width (e.g. 300px)
 * params.hideIfRatingLessThan        auutomatically hide the widget if rating is less than specified rating
 * params.hideOnTrendNegative         auutomatically hide the widget if trend is negative
 */

function irRatingWidget(params) {

    $('document').ready(function() {

        var apiPath = 'http://api.ratingscombined.com:80/v1/';

        // Get the base URL of the enclosing script
        var base = $("script[src$='/rating_widget.js']").attr('src').split("/").slice(0, -3).join("/") + "/";
        if (base === null) {
            return;
        }

        if (!params.container) {
            console.log('iReview widget error: params.container not defined');
            return;
        }
        if (!params.restaurantId) {
            console.log('iReview widget error: params.restaurantId not defined');
            return;
        }

        // get guest access token
        $.get(apiPath + 'authentications/guest', function (response) {
            if (!(response.items && response.items.accessToken)) {
                console.log('iReview widget error: server error');
                return;
            }
            var accessToken = response.items.accessToken;

            // get restaurant info
            $.get(apiPath + 'restaurants/list?id-in=' + params.restaurantId + '&access-token=' + accessToken, function (res) {
                if (res.items && res.items.length) {

                    var restaurant = res.items[0];

                    // calculate rating
                    var rating = Math.round(restaurant.overviews__percentile / 10) / 2;
                    if (rating < 1) rating = 1;
                    var ratingWhole = Math.trunc(rating);
                    var ratingHalf = 0;
                    if (rating - ratingWhole > 0){
                        ratingHalf = 5;
                    }

                    // do not show widget if rating is too low
                    if (params.hideIfRatingLessThan && rating < params.hideIfRatingLessThan){
                        return;
                    }

                    var trend_data = JSON.parse(restaurant.overviews__trend_series);
                    // trend change
                    var trend_change = 0.0;
                    var trend_change_abs = 0.0;
                    if(trend_data && trend_data.length > 1){
                        var last1, last2;
                        for (var kkey1 in trend_data[trend_data.length-1]){
                            last1 = trend_data[trend_data.length-1][kkey1];
                        }
                        for (var kkey2 in trend_data[trend_data.length-2]){
                            last2 = trend_data[trend_data.length-2][kkey2];
                        }
                        trend_change = Math.round((parseFloat(last1) - parseFloat(last2))*10) / 10;
                        trend_change_abs = Math.abs(trend_change);

                    }

                    // do not show widget if rating is too low
                    if (params.hideOnTrendNegative && trend_change < 0){
                        return;
                    }

                    // set parameters to be injected in html
                    var parameters = {
                        id: params.restaurantId,
                        base: base,
                        restaurant_name: restaurant.name,
                        current_trend_change: trend_change >= 0 ? '+ ' + trend_change_abs : '- ' + trend_change_abs,
                        current_trend_change_color: trend_change > 0 ? '#5cb85c' : (trend_change < 0 ? '#f0ad4e' : '#92B1BB'),
                        width: params.width || '160px',
                        ratingWhole: ratingWhole,
                        ratingHalf: ratingHalf,
                        reviews_str: restaurant.overviews__total_reviews == 1 ? '1 review' : restaurant.overviews__total_reviews + ' reviews'
                    };


                    var html =  ' \
                        <link rel="stylesheet" type="text/css" href="{{base}}modules/widget/rating_widget.css" media="screen" /> \
                        <div class="ireview-container" style="width:{{width}}">     \
                          <div id="restaurantName"><a style="color: #444 !important;" href="{{base}}#/restaurant/{{id}}">{{restaurant_name}}</a></div> \
                          <div style="margin-top: 2px;">\
                            <span style="background-color: {{current_trend_change_color}}; border-radius: .25em; font-size: 12px; padding: 2px 8px; color: white;">{{current_trend_change}}</span>\
                            <img src="{{base}}modules/widget/{{ratingWhole}}.{{ratingHalf}}.png" alt="" style="max-width: 62px;width: 62px;height: auto; vertical-align: middle;"/> \
                          </div> \
                          <div style="margin-top: 5px;">\
                            <a href="{{base}}#/restaurant/{{id}}" style="margin-left: 4px; color:#707070; ">{{reviews_str}}</a>\
                          </div>\
                          <div id="logo" style="margin-top: 8px;"> \
                              <a href="{{base}}" style="text-decoration:none;">\
                                <img src="{{base}}modules/widget/logo.png" alt="" style="vertical-align:middle;width:30px; height: auto;"/> \
                                <span style="vertical-align:middle; font-size: 16px; color: #568EA2; ">iReview</span>\
                              </a> \
                            </div> \
                        </div>';

                    // inject parameters
                    $.each( parameters, function(param, val){
                        html = html.split('{{' + param + '}}').join(val);
                    });

                    // inject html into container
                    $(params.container).html(html);

                } else {
                    console.log('iReview widget error: restaurant not found. Make sure restaurantId is correct.');
                }
            });
        });
    });

}