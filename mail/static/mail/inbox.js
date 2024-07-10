

document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  // Is their a nicer way to write thsi maybe with some data atributes and classes?
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
  close_button = document.querySelector('#close-button');
  close_button.addEventListener('click', () => {
  load_mailbox('inbox');
  });

  // Reply button
  // Review the reply functionality shoudl be a little diffrent from compose
  reply_button = document.querySelector('#reply-button');
  reply_button.addEventListener('click', () => {
    compose_email();
    document.querySelector('#compose-recipients').value = document.querySelector('#big-email2').querySelector('p').innerHTML.split(' ')[2];
    document.querySelector('#compose-subject').value = `Re: ${document.querySelector('#big-email2').querySelector('h1').innerHTML}`;
    document.querySelector('#compose-body').value = `On: ${document.querySelector('.email-timestamp').innerHTML} \n ${document.querySelector('.email-sender').innerHTML.split(': ')[1]} wrote: ${document.querySelector('#big-email2').querySelector('.email-text').innerHTML}\n ------------ \n`; // please make sense fo this line and write it diffrently becuase its long and illegible
    document.querySelector('#compose-body').focus();
  }
  );

});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#big-email').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  
// TODO: create a seprate function that checks if the email is valid
    function send_email(event){

      event.preventDefault();

      const recipients = document.querySelector('#compose-recipients').value ;
      const subject = document.querySelector('#compose-subject').value;
      const body = document.querySelector('#compose-body').value;

      // TODO: check ig this woeks
      if (recipients === '' || subject === '' || body === '') {
          alert('Please fill out all the fields');
      } else {
          console.log("Sending email");
          fetch('/emails', {
              method: 'POST',
              body: JSON.stringify({
                  recipients: recipients,
                  subject: subject,
                  body: body
              })
          })
          .then(response => response.json())
          .then(result => {
              // Print result
              console.log(result);
              window.location.reload(); // what does this do
          })
          .catch(error => {
              console.error('Error:', error);
          });
      }
    }


  document.querySelector('#compose-form').addEventListener('submit',(event) =>send_email(event));
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  console.log(document.querySelector('#emails-view').innerHTML);

  // this should clear the view befor putting the new ones in 
  document.querySelector('#emails-view').innerHTML = '';

  // Shows the emails view and hides comose and big email
  // IDEA: What if I just made big email have a higher z value
  console.log(document.querySelector('#emails-view').innerHTML);
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#big-email').style.display = 'none';

  // // TODO: edit something of this sort this is similar to the posts thing 
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(data => data.forEach(add_email));

    function add_email(email){
      // This is a function that creates the div from the email json 
      const email_div= document.createElement('div');
      email_div.className = `email ${email.read ? 'read' : 'unread'}`; // note the short hand notation for if else statments
      const emailContent = `
      <p>${email.sender}</p>
      <p>${email.subject}</p>
      <p>${format_date(email.timestamp)}</p>
      <p class = 'archive-button'>Archive</p>
  `;
      // Fill in the email div 
      email_div.innerHTML = emailContent;

      // `On click event that allows you to open the big view of the email 
      email_div.addEventListener('click', () => {
        load_email(email.id);
      });

      // Add the email to the emails-view
      document.querySelector('#emails-view').appendChild(email_div);
    }

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}


// HAS THIS BEEN DONE ?
// TODO: find a way to run load email when an email is clicked

function load_email(email_id){

  // TODO: This function re- add all the emails each time make sure this doesn't happen
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#big-email').style.display = 'block';
  document.querySelector('#big-email2').innerHTML = '';

  // Empty out all the contents before running this fucntion not sure if this is the best way tho 
  fetch(`/emails/${email_id}`)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(email => {
    console.log(email);
    display_email(email);
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

function display_email(email){
  const container = document.querySelector('#big-email2');
  let subject = document.createElement('h1');
  let sender = document.createElement('p');
  let timestamp = document.createElement('p');
  let email_text = document.createElement('p');
  email_text.innerHTML = email.body;
  email_text.className = 'email-text';
  sender.className = 'email-sender';
  timestamp.className = 'email-timestamp';
  subject.innerHTML = toTitleCase(email.subject);
  sender.innerHTML = `Sent by: ${email.sender}`;
  timestamp.innerHTML = email.timestamp;
  container.appendChild(subject);
  container.appendChild(sender);
  container.appendChild(timestamp);
  container.appendChild(email_text);
  };

// NOTE: this function currently doesn't work
// change this to not have the time in seconds 
//  change this to say x h ago or x days ago
function format_date(timestamp){
  const date = new Date();
  const time = new Date(timestamp)
  if (date.getDate() === time.getDate()){
    return time.toLocaleTimeString();
  } else {
    return time.toLocaleDateString();
  }
}
function toTitleCase(text) {
  return text.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}