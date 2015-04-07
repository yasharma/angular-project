/*
 * params.container                   jQuery selector (e.g., '#foo' or '.foo') of div container for the widget
 * params.restaurantId                Restaurant ID as stored in iReview system
 * params.width                       widget's css width (e.g. 300px)
 * params.hideIfRatingLessThan        auutomatically hide the widget if rating is less than specified rating
 */

function irRatingWidget(params) {

    $('document').ready(function() {

        var apiPath = 'http://api.reviews-combined.com:80/v1/';

        // Get the base URL of the enclosing script
        var base = $("script[src$='/rating_widget.js']").attr('src').split("/").slice(0, -3).join("/")+"/";
        if (base === null) {
            return;
        }

        if (! params.container) {
            console.log('iReview widget error: params.container not defined');
            return;
        }
        if (! params.restaurantId) {
            console.log('iReview widget error: params.restaurantId not defined');
            return;
        }

        // get guest access token
        $.get(apiPath + 'authentications/guest', function(response){
            if(! (response.items && response.items.accessToken)){
                console.log('iReview widget error: server error');
                return;
            }
            var accessToken = response.items.accessToken;

            // get restaurant name
            $.get(apiPath + 'restaurants/' + params.restaurantId + '?access-token=' + accessToken, function(restaurant){
                if(! restaurant.name){
                    console.log('iReview widget error: restaurant not found. Make sure restaurantId is correct.');
                    return;
                }

                // get restaurant stats
                $.get(apiPath + 'restaurants/' + params.restaurantId +'/stats?access-token=' + accessToken, function(stats){
                    if(! (stats.items && stats.items.current_percentile)){
                        console.log('iReview widget error: restaurant stats not found. Make sure restaurantId is correct.');
                        return;
                    }

                    var rating = Math.round(stats.items.current_percentile / 10) / 2;
                    if (rating < 1) rating = 1;
                    var ratingWhole = Math.trunc(rating);
                    var ratingHalf = 0;
                    if (rating - ratingWhole > 0){
                        ratingHalf = 5;
                    }

                    if (params.hideIfRatingLessThan && rating < params.hideIfRatingLessThan){
                        return;
                    }

                    var parameters = {
                        id: params.restaurantId,
                        base: base,
                        restaurant_name: restaurant.name,
                        current_percentile: stats.items.current_percentile,
                        current_trend: stats.items.current_trend,
                        total_reviews: stats.items.total_reviews,
                        width: params.width || '160px',
                        ratingWhole: ratingWhole,
                        ratingHalf: ratingHalf,
                        reviews_str: stats.items.total_reviews == 1 ? '1 review' : stats.items.total_reviews + ' reviews'
                    };


                    var html =  ' \
                        <link rel="stylesheet" type="text/css" href="{{base}}modules/widget/rating_widget.css" media="screen" /> \
                        <div class="ireview-container" style="width:{{width}}">     \
                          <div id="restaurantName"><a style="color: #444 !important;" href="{{base}}index.html#/restaurant/{{id}}">{{restaurant_name}}</a></div> \
                          <div style="margin-top: 3px;">\
                            <img src="{{base}}modules/widget/{{ratingWhole}}.{{ratingHalf}}.png" alt="" style="max-width: 62px;width: 62px;height: auto; vertical-align: middle;"/> \
                            <a href="{{base}}index.html#/restaurant/{{id}}" style="margin-left: 4px; color:#707070; ">{{reviews_str}}</a>\
                          </div> \
                          <div id="logo" style="margin-top: 8px;"> \
                              <a href="{{base}}index.html" style="text-decoration:none;">\
                                <img src="{{base}}modules/widget/logo.png" alt="" style="vertical-align:middle;width:30px; height: auto;"/> \
                                <span style="vertical-align:middle; font-size: 16px; color: #568EA2; ">iReview</span>\
                              </a> \
                            </div> \
                        </div>';


                    $.each( parameters, function(param, val){
                        html = html.split('{{' + param + '}}').join(val);
                    });

                    $(params.container).html(html);

                });
            });
        });
    });
}