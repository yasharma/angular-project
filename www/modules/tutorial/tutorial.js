// Sideshow tutorial (outside of Angular context)
(function () {
    // init sideshow
    Sideshow.config.language = "en";
    Sideshow.config.autoSkipIntro = true;
    Sideshow.init();
    // we call registerWizard() for every page (every wizard)

    // restaurant search page wizard
    Sideshow.registerWizard({
        name: "introducing_sideshow",
        title: "Tutorial",
        description: "Introducing the main features of ReviewsCombined. ",
        estimatedTime: "2 Minutes",
        affects: [
            function () {
                // show this tutorial only on pages where mentioned elements exist
                return elementsExist(["#rc-sort-picker", "#rc-search-filters"]);
            }
        ]
    }).storyLine({
        showStepPosition: true,
        steps: [
            {
                title: "Search",
                text: "Search for Restaurant by Name or Address.",
                subject: "#rc-main-search-box"
            },
            {
                title: "Location",
                text: "Search by 'Location' or Check 'Near Me' to find Restaurants within 2km radius.",
                subject: "#rc-search-form-location"
            },
            {
                title: "Sort",
                text: "Sort Results by ‘Trend’ (Current Restaurant Rating) or ‘Rating’ (The average rating from all reviews) or ‘Distance’ (Sort by Closest to Furthest).",
                subject: "#rc-sort-picker"
            },
            {
                title: "Filter",
                text: "Filter results by amending extra settings.",
                subject: "#rc-search-filters"
            }
        ]
    });
    // checks if all elements in a given list exist
    function elementsExist(elements_array) {
        for (var i in elements_array) {
            if ($(elements_array[i]).length == 0) {
                return false;
            }
        }
        return true;
    }
})();
