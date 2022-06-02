(function ($) {
    "use strict";


     /*==================================================================
    [ Focus input ]*/
    $('.input100').each(function(){
        $(this).on('blur', function(){
            if($(this).val().trim() != "") {
                $(this).addClass('has-val');
            }
            else {
                $(this).removeClass('has-val');
            }
        })    
    })
  
  
    /*==================================================================
    [ Validate ]*/
    var input = $('.validate-input .input100');

    $('.validate-form').on('submit',function(){
        var check = true;

        for(var i=0; i<input.length; i++) {
            if(validate(input[i]) == false){
                showValidate(input[i]);
                check=false;
            }
        }

        if (check) {
            $('#submit-btn').prop('disabled', true);
            $('#loading').css('display','block');
            $.post( "/_login", $(this).serialize(), function( data ) {
                console.log(data);
                if (data.status) {
                    var form = $('<form action="" method="POST"/>').attr({action: data.url});
                    for(var i=0; i<data.form.length; i++) {
                        $('<input>', {
                            type: 'hidden',
                            name: data.form[i].k,
                            value: data.form[i].v
                        }).appendTo(form);
                    }
                    form.appendTo($(document.body)).submit(); //it has to be added somewhere into the <body>
                } else {
                    $('#submit-btn').prop('disabled', false);
                    $('#loading').css('display', 'none');
                    alert('Invalid response, cannot connect. Please try again...')
                }
            });
        }

        return false;
    });


    $('.validate-form .input100').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });

    function validate (input) {
        if($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        }
        else {
            if($(input).val().trim() == ''){
                return false;
            }
        }
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }
    
    

})(jQuery);