document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

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
          window.location.reload();
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
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  fetch('/emails/inbox')
  .then(response => response.json())
  .then(data => data.forEach(add_email));
  // .then(data => data.forEach(email => console.log(email)));
  // .then(data => data.forEach(add_email));
  // function load_emails(){
  //   fetch('emails/inbox')
  //   .then(response => response.json())
  //   .then(console.log(response))
  //   .then(emails => {
  //     emails.forEach(add_email);
  //   });
  // }
  // // TODO: edit something of this sort this is similar to the posts thing 

  function add_email(email){
    const email_div= document.createElement('div');
    email_div.className = 'email';
    const emailContent = `
    <p>${email.sender}</p>
    <p>${email.subject}</p>
    <p>${format_date(email.timestamp)}</p>
`;
    email_div.innerHTML = emailContent;
    document.querySelector('#emails-view').appendChild(email_div);
  }
  
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}

// NOTE: this function currently doesn't work
// TODO: fix this function
function format_date(timestamp){
  const date = new Date();
  const time = new Date(timestamp)
  if (date.getDate() === time.getDate()){
    return time.toLocaleTimeString();
  } else {
    return time.toLocaleDateString();
  }
}