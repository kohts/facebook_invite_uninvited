(function(){
     var event_id;
     var observer = new WebKitMutationObserver(
   function(mutations) {
       if(mutations.length && window.location.href.indexOf('events')>=0){
     if(mutations[0].addedNodes.length){
         var fbBrowser = mutations[0].addedNodes[0].getElementsByClassName('fbProfileBrowser');
         if(fbBrowser.length>0){
       event_id='';
       var form = mutations[0].addedNodes[0].getElementsByTagName('form');
       if(form.length){
           var plan_id=form[0].action.match(/plan_id=[0-9]+/);
           if(plan_id && plan_id.length)
         event_id = plan_id[0].match(/[0-9]+/)[0];
       }

       var btns = fbBrowser[0].parentNode.parentNode.getElementsByClassName('uiOverlayFooterButtons');
       if(btns.length && event_id.length){
           btns=btns[0];
           if(btns.tagName.toLowerCase()=='td'){
         var a = document.createElement('a');
         a.href="#";
         a.addEventListener('click', select_friends);
         a.innerHTML="<span class=\"uiButtonText\">Select uninvited</span>";
         a.className="layerConfirm autofocus uiOverlayButton uiButton uiButtonConfirm uiButtonLarge";
         a.style.color="white";
         btns.appendChild(a);
           }
       }
         }
     }
       }
   });
     observer.observe(document.body, {childList: true});

     function select_friends(){
   if(!event_id)
       return null;
   var reg = /id=[0-9]+/g;
   var source, ids=[], tmp_ids=[], s, user_id;

   for(var i=document.scripts.length-1; i--;i>=0){
       s+=document.scripts[i].text;
   };
   user_id = s.match(/"user":"[0-9]+/)[0].match(/[0-9]+/)[0];


   function get_response(data){
       var fbBrowser = document.getElementsByClassName('fbProfileBrowser');
       if(fbBrowser.length>0){

     source = data.srcElement.responseText;
     tmp_ids = source.match(reg);
     var id;
     for(var i=tmp_ids.length-1;i>=0;i--){
         id=tmp_ids[i].match(/[0-9]+/)[0];
         if(id!=event_id && ids.indexOf(id)==-1)
       ids.push(id);
     }
     var friends = fbBrowser[0].getElementsByClassName('checkbox');
     for(i=friends.length-1;i>=0;i--){
         if(!friends[i].checked && ids.indexOf(friends[i].value)==-1 && friends[i].parentNode.className.indexOf('disabledCheckable')==-1){
       friends[i].click();

         }
     }
       }
   };

   var request = new XMLHttpRequest();
   request.onload = get_response;
   request.open("GET", '/ajax/browser/dialog/event_members/?id='+event_id+'&edge=temporal_groups%3Ainvitees_of_temporal_group&showstatus=0&__asyncDialog=1&__user='+user_id+'&__a=1&__req=a', true);
   request.send(null);
   return null;
     }


 })();
