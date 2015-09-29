// Script for handling chat sessions with Kandy

$(function() {   
  var me = {};

  var myInterval='';

  me.start = function() {    
    wireUI();
    loadContacts();
    // Checks every 5 seconds for incoming messages
    // CC = This getIM will update the last seen of the logged in user
    myInterval = setInterval(receiveMessages, 5000);
  };

  me.cleanup = function() {
    clearInterval(myInterval);
    myInterval = null;
  };

  // Wire up our UI elements for chat
  function wireUI() {
    // Event handler for send message button
    $('#chat-btn').on('click', function() {
      sendMessage();
    });

      $('#chat-message').bind('keypress', function(event) {
        if (event.keyCode === 13) {
          $("#chat-btn").trigger('click');
        }
      });
  };

  // Function that loads all Kandy contacts and appends to DOM
  function loadContacts() {

    /** retrievePersonalAddressBook(success, failure)
        Retrieve all entries of the user's personal address book
        @params <function> success, <function> failure
    */
    KandyAPI.Phone.retrievePersonalAddressBook(function(results) {

      // results object is an array of address book entries sent by Kandy
      // on successful address book retrieval
      if (results.length) {

        // Iterate through entries and append contacts to DOM
        results.forEach(function(entry) {
          var $option = $('<option>');

          $option.val(entry.contact_user_name).text(entry.contact_user_name);
    // CC ADDED
          //$('#chat-contacts').append($option);
        });
      } else {
        alert('Sorry, you have no contacts in your address book');
      }
    }, function () {
        alert('Error - something went wrong when we tried to access your address book.');
    });
  }

  // Function to send message to another Kandy user
  function sendMessage() {
    var message = $('#chat-message').val();
    var sendTo = $('#chat-contacts').val();
    console.log("Sending to " +sendTo);

    /** sendIm(userName, message, success, failure)
        Sends a message via chat
        @params <string> userName, <string> message, <function> success/failure
    */
    KandyAPI.Phone.sendIm(sendTo, message, function () {

      // On successful send, append chat item to DOM
      var $chatItem = $('<div class="well text-right">')
      var $username = $('<h5>').text($('.username').text());
      var $toName = $('<h5>').text("TO: " + sendTo);
      var $message = $('<p>').text(message);

      $chatItem.append($username, $toName, $message);
      $('#chat-messages').append($chatItem);
      $('#chat-message').val('');
    },
    function () {
        alert('IM send failed');
      }
    );
  }

  // Function to receive messages from other Kandy users
  function receiveMessages() {

    /** getIm(success, failure)
        Retrieve any new instant messages (text, files, etc.)
        @params <function> success/failure
    */
    KandyAPI.Phone.getIm(function(data) {
        // console.log(" --- getting IM , this will update my timestamp 3 " + JSON.stringify(data));
        // data object is an array of incoming messages sent on successful getIM()
        // Iterate through data object & append messages to DOM
        data.messages.forEach(function (msg) {

            if (msg.messageType == 'chat' && msg.contentType === 'text' && msg.message.mimeType == 'text/plain') {
                var $username = $('<h5>').text(msg.sender.user_id);
                var $message = $('<p>').text(msg.message.text);
                var $chatItem = $('<div class="well text-left">')

                $chatItem.append($username, $message);
                $('#chat-messages').append($chatItem);
            } else {
                // When the recieved messageType is not chat, display message type
                console.log('received ' + msg.messageType + ': ');
            }
        });

        //Update the chat-contacts select box
        if (data.messages && data.messages.length > 0) {
            var lastMessage = data.messages[data.messages.length - 1];
            var username = lastMessage.sender.full_user_id;

            $("#chat-contacts").find("option").attr("selected", "");
            var existing = $("#chat-contacts").find("option[value=\"" + username + "\"]");
            if (existing.length > 0) {
                existing.attr("selected", "selected");
            } else {
                $("<option>").attr("value", username).attr("selected", "selected").text(username).appendTo($("#chat-contacts"));
            }
        }

    },
    function() {
      alert('error recieving IMs');
    });
  }

  window.chat = me;
});
