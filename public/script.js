$(document).ready(function () {
    getCategories();
    checkForm();

    $('#site').on('change', function () {
        $('#type')
            .find('option')
            .remove()
            .end();
        getCategories();
        checkForm()
    });

    function checkForm() {
        if ($('#site').val() === 'https://pl.wikipedia.org/wiki/Portal:Kategorie_G%C5%82%C3%B3wne') {
            $('#articleLength').prop('disabled', true);
        } else {
            $('#articleLength').prop('disabled', true);
        }
        $('#searchArticles').attr('disabled', 'disabled');
    }

    $('#articlesNumber').on('keyup', function () {
        let inputValue = parseInt($('#articlesNumber').val());
        if (inputValue <= 0 || inputValue > 999 || $('#articlesNumber').val() === '') {
            $('#searchArticles').attr('disabled', 'disabled');
        } else $('#searchArticles').removeAttr('disabled');
    });

    $('#getCategories').on('click', function () {
        getCategories();
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
            console.log('Senden request to download articles!');
        });
    });

    function getCategories() {
        let categoryURL = $('select#site').val();
        $.ajax({
            method: "POST",
            url: "/getCategories",
            data: {site: categoryURL}
        }).done(function (data) {
            data.forEach(link => {
                $('#type').append($('<option>', {
                    value: link.value,
                    text: link.text
                }));
            });
        });
    }
});