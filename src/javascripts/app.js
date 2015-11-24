/*
* @module App
*/

import {TodosCtrl} from './controllers/todos_ctrl';

//var todosCtrl = new TodosCtrl();


//todosCtrl.initList()

(function(){
    let todosCtrl = new TodosCtrl();
    todosCtrl.initList();
    
    $('.todos-list li').on('mouseover', function(){
      $(this).find('.actions').show();
    }).on('mouseout', function(){
      $(this).find('.actions').hide();
    });

    $('.todos-list .action').on('click', function(){
      if($(this).hasClass('edit')){
        alert('edit');
      }else{
        alert('remove')
      }
    });

})();
