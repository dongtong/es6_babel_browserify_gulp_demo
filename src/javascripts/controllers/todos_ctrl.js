/*
* @class TodosCtrl
*/

import {Todo} from '../models/todo';
import {Util} from '../common/util';
import Edit from '../views/todos/edit';


class TodosCtrl {
  constructor() {
    //define current class namespace
    window.todosNS = window.todosNs || {};
  }

  initList() {
    var hasResult = false,
        that = this;

    that.observeNew();

    todosNS.gotTodos = function(res) {
      hasResult = true;
      if(res.data.length) {
          res.data.map((item) => {
              $('.todos-list').append(
                  '<li data-id="' + item.id + '"><span>' + item.content + '</span>' +
                    '<span class="actions">' +
                      '<span class="action edit glyphicon glyphicon-pencil" id="eidt_'+item.id+'"></span>' +
                      '<span class="action remove glyphicon glyphicon-remove" id="remove_'+item.id+'"></span>' +
                    '</span>' +
                  '</li>'
              );
          });
          that.observeTodoList();
      }else{
          $('.todos-list').append('<li>没有待办事项...</li>');
      }

    }

    Util.ajaxReq({
      url: 'http://localhost:3000/api/v2/todos',
      jsonpCallback: 'todosNS.gotTodos',
      observeRes: function(){return hasResult;}
    })
  }

  observeTodoList() {
    let $this = this;
    $('.todos-list li').on('mouseover', function(){
      $(this).find('.actions').show();
    }).on('mouseout', function(){
      $(this).find('.actions').hide();
    });

    $('.todos-list').on('click', '.edit', function(){ // can not use () =>
        $this.edit({
          id: $(this).attr('id'),
          value: $(this).parent().prev().text()
        });
    }).on('click', '.remove', function(){
        $this.remove($(this).attr('id').split('_')[1]);
    });
  }

  observeNew() {
      let $this = this;
      $('form').on('submit', function(e){
              e.preventDefault();
              $this.create($('#new_todo').val());
              return false;
      });
  }

  create(content) {
    let $this = this,
        hasResult = false;

    todosNS.addedTodo = function(res) {
        hasResult = true;
        if(res.success){
            $('#new_todo').val("");
            let newItem = '<li data-id="' + res.id + '"><span>' + res.content + '</span>' +
              '<span class="actions">' +
                '<span class="action edit glyphicon glyphicon-pencil" id="eidt_'+res.id+'"></span>' +
                '<span class="action remove glyphicon glyphicon-remove" id="remove_'+res.id+'"></span>' +
              '</span>' +
            '</li>';

            if($('.todos-list span').length){
                $('.todos-list').append(newItem);
            }else{
                $('.todos-list').html(newItem);
            }
            $this.observeAddedItem();
        }else{
            alert('添加失败!');
        }

    }

    Util.ajaxReq({
      url: 'http://localhost:3000/api/v2/todos/add?content=' + content,
      jsonpCallback: 'todosNS.addedTodo',
      observeRes: function(){return hasResult;}
    });
  }

  observeAddedItem() {
      $('.todos-list li:last-child').on('mouseover', function(){
        $(this).find('.actions').show();
      }).on('mouseout', function(){
        $(this).find('.actions').hide();
      }).on('click', '.edit', function(){ // can not use () =>
          $this.edit({
            id: $(this).attr('id'),
            value: $(this).parent().prev().text()
          });
      }).on('click', '.remove', function(){
          $this.remove($(this).attr('id').split('_')[1]);
      });
  }

  edit(params) { //TODO move to model
    let $this = this,
        $li = $('#' + params.id).parents('li');

    $li.html(Edit(params))
       .find('input').on('keyup', function(e){
           let newContent = $(this).val();
           if(e.which == 13) {
               $this.update({
                   url: 'http://localhost:3000/api/v2/todos/' + params.id.split('_')[1] + '/update?content=' + encodeURIComponent(newContent),
                   done: function(res){
                       if(res.success) {
                           $li.html(
                             '<span>' + res.content + '</span>' +
                               '<span class="actions">' +
                                 '<span class="action edit glyphicon glyphicon-pencil" id="eidt_'+res.id+'"></span>' +
                                 '<span class="action remove glyphicon glyphicon-remove" id="remove_'+res.id+'"></span>' +
                             '</span>'
                           );
                       }else{
                         alert('更新失败')
                       }

                   }
               });
            }
    });
  }

  update(params) {
    let hasResult = false;

    todosNS.updatedTodo = function(res) {
        hasResult = true;
        params.done(res);
    }

    Util.ajaxReq({
      type: 'PATCH',
      url: params.url,
      jsonpCallback: 'todosNS.updatedTodo',
      observeRes: function(){return hasResult;}
    });
  }

  remove(id) {
    let $this = this,
        hasResult = false,
        $li = $('#remove_' + id).parents('li');

    todosNS.removedTodo = function(res) {
        hasResult = true;
        if(res.success){
            if($('.todos-list li').length == 1){
                $li.replaceWith('<li>没有待办事项...</li>');
            }else{
                $li.remove();
            }
        }else{
            alert('删除失败!');
        }

    }

    Util.ajaxReq({
      url: 'http://localhost:3000/api/v2/todos/' + id + '/delete',
      jsonpCallback: 'todosNS.removedTodo',
      observeRes: function(){return hasResult;}
    });
  }
}

export {TodosCtrl};
