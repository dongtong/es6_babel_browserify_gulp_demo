/*
* @module App
*/

import {TodosCtrl} from './controllers/todos_ctrl';

(function(){
    let todosCtrl = new TodosCtrl();
    todosCtrl.initList();
})();
