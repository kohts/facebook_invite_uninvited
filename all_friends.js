(function(){
   var event_id;
   var observer = new WebKitMutationObserver(
     function(mutations) {
       if(mutations.length) {
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
                 a.href="javascript:;";
                 a.addEventListener('click', select_friends);
                 a.innerHTML="<span class=\"uiButtonText\">Select uninvited</span>";
                 a.className="layerConfirm autofocus uiOverlayButton uiButton uiButtonConfirm uiButtonLarge";
                 a.style.color="white";
                 btns.appendChild(a);
                 var clear = document.createElement('a');
                 clear.href="javascript:;";
                 clear.addEventListener('click', deselect_all);
                 clear.innerHTML="<span class=\"uiButtonText\">Clear selected</span>";
                 clear.className="layerConfirm autofocus uiOverlayButton uiButton uiButtonLarge";
                 btns.appendChild(clear);

               }
             }
           }
         }
       }
     });
   observer.observe(document.body, {childList: true});

   var deselect_all = function(){
     var fbBrowser = document.getElementsByClassName('fbProfileBrowser');
     var friends = fbBrowser[0].getElementsByClassName('checkbox');
     for(var i=friends.length-1;i>=0;i--){
       if(friends[i].checked && friends[i].parentNode.className.indexOf('disabledCheckable')==-1){
         friends[i].click();

       }
     }

   };

   var select_friends = function(){
     if(!event_id)
       return null;
     var reg = /id=[0-9]+/g;
     var source, ids=[], tmp_ids=[], s, user_id;

     for(var i=document.scripts.length-1; i--;i>=0){
       s+=document.scripts[i].text;
     };
     user_id = s.match(/\"user\":\"[0-9]+/)[0].match(/[0-9]+/)[0];

     var get_response = function(data){
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

     var number_friends = 0;
     var request = new XMLHttpRequest();

     request.onload = function(data){
       source = data.srcElement.responseText;
       number_friends = source.match(/uid/g).length;

       function recur(){
         var l = document.getElementsByClassName('fbProfileBrowser')[0].getElementsByClassName('fbProfileBrowserResult')[1];
         if(l.getElementsByClassName('checkbox').length<number_friends){
           l.scrollTop = l.scrollHeight-l.offsetHeight;
           setTimeout(recur,1000);
         }
         else{
           request = new XMLHttpRequest();
           request.onload = get_response;
           request.open("GET", '/ajax/browser/dialog/event_members/?id='+event_id+'&edge=temporal_groups%3Ainvitees_of_temporal_group&showstatus=0&__asyncDialog=1&__user='+user_id+'&__a=1&__req=a', true);
           request.send(null);
         }
       }
       recur();


     };
     request.open("GET", 'http://www.facebook.com/ajax/plans/typeahead/invite.php?include_all=true&plan_id='+event_id+'&__user='+user_id+'&__a=1&__req=2h', true);
     request.send(null);



     return null;
   };
 })();