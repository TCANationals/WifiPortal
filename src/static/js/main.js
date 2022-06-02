// https://github.com/cmlenz/jquery-iframe-transport
!function(l){"use strict";l.ajaxPrefilter(function(t,e,a){if(t.iframe)return t.originalURL=t.url,"iframe"}),l.ajaxTransport("iframe",function(t,e,a){var n=null,i=null,r="iframe-"+l.now(),o=l(t.files).filter(":file:enabled"),d=null;function u(){o.each(function(t,e){e=l(e);e.data("clone").replaceWith(e)}),n.remove(),i.one("load",function(){i.remove()}),i.attr("src","about:blank")}if(t.dataTypes.shift(),t.data=e.data,o.length)return n=l("<form enctype='multipart/form-data' method='post'></form>").hide().attr({action:t.originalURL,target:r}),"string"==typeof t.data&&0<t.data.length&&l.error("data must not be serialized"),l.each(t.data||{},function(t,e){l.isPlainObject(e)&&(t=e.name,e=e.value),l("<input type='hidden' />").attr({name:t,value:e}).appendTo(n)}),l("<input type='hidden' value='IFrame' name='X-Requested-With' />").appendTo(n),d=t.dataTypes[0]&&t.accepts[t.dataTypes[0]]?t.accepts[t.dataTypes[0]]+("*"!==t.dataTypes[0]?", */*; q=0.01":""):t.accepts["*"],l("<input type='hidden' name='X-HTTP-Accept'>").attr("value",d).appendTo(n),o.after(function(t){var e=l(this),a=e.clone().prop("disabled",!0);return e.data("clone",a),a}).next(),o.appendTo(n),{send:function(t,o){(i=l("<iframe src='about:blank' name='"+r+"' id='"+r+"' style='display:none'></iframe>")).one("load",function(){i.one("load",function(){var t=this.contentWindow?this.contentWindow.document:this.contentDocument||this.document,e=t.documentElement||t.body,a=e.getElementsByTagName("textarea")[0],n=a&&a.getAttribute("data-type")||null,i=a&&a.getAttribute("data-status")||200,t=a&&a.getAttribute("data-statusText")||"OK",e={html:e.innerHTML,text:n?a.value:e?e.textContent||e.innerText:null};u(),o(i,t,e,n?"Content-Type: "+n:null)}),n[0].submit()}),l("body").append(n,i)},abort:function(){null!==i&&(i.unbind("load").attr("src","about:blank"),u())}}})}(jQuery);

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
            $.post( "/_login", $(this).serialize(), function( data ) {
                console.log(data);
                if (data.status) {
                    $('<form action="" method="POST"/>')
                        .attr({action: data.url})
                        .append($('<input type="hidden" name="username">').val(data.user))
                        .append($('<input type="hidden" name="password">').val(data.pass))
                        .append($('<input type="hidden" name="magic">').val(data.magic))
                        .appendTo($(document.body)) //it has to be added somewhere into the <body>
                        .submit();
                } else {
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