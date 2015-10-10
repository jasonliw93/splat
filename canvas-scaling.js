setCanvasImage: function(image) {
    var canvas = this.$('#imageCanvas')[0]
    var ctx = canvas.getContext('2d');
    var img = new Image();
    var self = this;
    img.onload = function() {
        var width;
        var height;
        var y = 0;
        var x = 0;
        if (img.width / img.height > canvas.width / canvas.height) {
            width = canvas.width; //canvas.width / img.width 225px to 450 then scale is 2
            height = img.height * canvas.width / img.width;
            y = (canvas.height - height) / 2;
        } else {
            width = img.width * canvas.height / img.height; //canvas.width / img.width 225px to 450 then scale is 2
            height = canvas.height;
            x = (canvas.width - width) / 2;
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, img.width, img.height,
            x, y, width, height);
        self.model.set('poster', canvas.toDataURL());
    };
    img.src = image;
}