var fs = require('fs');
function onDelete(id) {
  
  fs.unlink(id, function(error) {
    if (error) {
        throw error;
    }
    console.log('Deleted dog.jpg!!');
});
}