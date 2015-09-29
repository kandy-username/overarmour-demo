/**
* Demo app model builder and handler.
**/

/**
* display_items
* This function will display shoes list in shoes.html
* @param {object} items - items object.
**/
function display_items(items) {
  var items_list = '<div class="bold shoes-feature">Featured: UA SpeedForm &copy; Gemini</div>';
  for(var i=0; i <items.length;i++){
    items_list +='<div class="thumbnails-cols">' 
                   +'<img class="item-thumb-image" src="'+items[i].img+'">'
                   +'<div>'
                     +'<ul>'
                       +'<li class="bold">'+items[i].name+'</li>'
                       +'<li>'+items[i].price+'</li>'
                       +'<li><div class="rating"><span>☆</span><span>☆</span><span>☆</span><span>☆</span><span>☆</span><em class="normal-imp">'+items[i].rating+'</em></div></li>'
                     +'</ul>'
                   +'</div>'
               +'</div>';
  }
  return items_list;
}