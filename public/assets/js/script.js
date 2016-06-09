var socket = io.connect();
var editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
	mode: "javascript",
	theme: "default",
	lineNumbers: true,
	lineWrapping: true
});
var doc = editor.getDoc();
var space = 0;
var selections = [];

$(document).ready(function() {
	socket.emit('join', 'xyz', function(data, socketlist, socketid) {
		setWidthSpace();
		editor.setValue(data);
		var mySocketId = socketid.replace('/#', '');
		socketlist.forEach(function (clientid) {
			if(mySocketId != clientid) {
				console.log(clientid);
				$('.CodeMirror-sizer').append('<div data-client="'+clientid+'" class="custom-cursor" style="top:0px;left:0px;"></div>');
			}
		});
	});
});

editor.setOption('extraKeys', {
	Tab: function(cm) {
		var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
		cm.replaceSelection(spaces);
	}
});

editor.on('change', function(editor, data) {
	if(data.origin != 'change' && data.origin != 'setValue') {
		var char = data.from.ch;
		var line = data.from.line;
		var key = data.text;
		var cursor = editor.getCursor();
		socket.emit('change', data);
	}
});

editor.on('cursorActivity', function(editor) {
	var cursor = editor.getCursor();
	var selection = editor.getSelections();
	if(selection[0].length > 0){
		socket.emit('client-selection', { from: editor.getCursor(true), to: editor.getCursor(false) });
	} else {
		console.log(selection[0].length + 'clear');
		socket.emit('client-selection-clear');
	}
	socket.emit('cursor-activty-client', cursor);
});

socket.on('client-selection-receive', function(selection) {
	var clientid = selection.socketid.replace('/#', '');
	if(selections[clientid] !== undefined) {
		selections[clientid].clear();
	}
	selections[clientid] = doc.markText({line: selection.from.line, ch: selection.from.ch}, {line: selection.to.line, ch: selection.to.ch}, {
		className: 'derp',
	});
});

socket.on('client-selection-clear-receive', function(clientId) {
	clientId = clientId.replace('/#', '');
	console.log(clientId);
	if(selections[clientId] !== undefined) {
		selections[clientId].clear();
	}
});

socket.on('client-joined', function(client) {
	var clientid = client.replace('/#', '');
	$('.CodeMirror-sizer').append('<div data-client="'+clientid+'" class="custom-cursor" style="top:0px;left:0px;"></div>');
});

socket.on('change-receive', function(data) {
	editor.replaceRange(data.text, {line: data.from.line, ch: data.from.ch }, {line: data.to.line, ch: data.to.ch }, 'change');
});

socket.on('cursor-activty', function(cursor) {
	var clientid = cursor.socketid.replace('/#', '');
	var lineWidth = $('.CodeMirror-line span')[0].getBoundingClientRect().width;
	var lineHeight = $('.CodeMirror-line').height();
	var charAmount = doc.getLine(0).length;
	$('.custom-cursor[data-client='+clientid+']').css({
		"top": (cursor.line*lineHeight),
		"left": (((cursor.ch)*space))
	});
});

socket.on('getValue', function(callback) {
	callback(editor.getValue());
});

socket.on("client-left", function(clientId){
	clientId = clientId.replace('/#', '');
	$('.custom-cursor[data-client='+clientId+']').remove();
});

function setWidthSpace() {
	editor.setValue(" ");
	space = $('.CodeMirror-line span')[0].getBoundingClientRect().width;
}
