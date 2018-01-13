$(document).ready(function () {
    $('#getCategories').on('click', function () {
        $.get("/getCategories", function (data) {
            data.forEach(link => {
                $('#type').append($('<option>', {
                    value: link.value,
                    text: link.text
                }));
            });
        })
    });

    $('#searchArticles').on('click', function () {
        let site = $('#site').val();
        let type = $('#type').val();
        let articlesNumber = $('#articlesNumber').val();
        let articleLength = $('#articleLength').val();
        $.ajax({
            method: "POST",
            url: "/download",
            data: {site: site, type: type, articlesNumber: articlesNumber, articleLength: articleLength}
        }).done(function () {
            console.log("Send form");
        });
    });
});