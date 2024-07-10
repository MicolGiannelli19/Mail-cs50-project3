

document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
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


  // NOTE: this shoudl probably take the email id 
  reply_button = document.querySelector('#reply-button');
  reply_button.addEventListener('click', async () => {
    compose_email(); // Open the new email view

    let reply_id = document.querySelector('#big-email').dataset.emailId; // Retrieve the id of the original email

    try {
      let reply_data = await email_reply_data(reply_id); // Fetch email data
      console.log(reply_data);

      // Populate the form with the data from the reply
      document.querySelector('#compose-recipients').value = reply_data.recipients;
      document.querySelector('#compose-subject').value = reply_data.subject;
      document.querySelector('#compose-body').value = reply_data.body;
      document.querySelector('#compose-body').focus();
    } catch (error) {
      console.error('Error fetching reply data:', error);
    }
  });

});

async function email_reply_data(email_id) {
  try {
    const response = await fetch(`emails/${email_id}`);
    const email = await response.json();

    console.log(email);

    return {
      recipients: email.sender,
      subject: `Re: ${email.subject}`,
      body: `\n\nOn ${email.timestamp}, ${email.sender} wrote:\n${email.body}\n-------\n`
    };
  } catch (error) {
    console.error('Error:', error);
  }
}

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

  document.querySelector('#compose-form').addEventListener('submit',(event) =>send_email(event));
}


function send_email(event){
  event.preventDefault();

  // Fucntionality to send email when clicking send on compose form 
  const recipients = document.querySelector('#compose-recipients').value ; // I have some  questions about js variables ... If they are defined inside a funciton are they still valid across the whole document
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

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  console.log(document.querySelector('#emails-view').innerHTML);

  // Clear the view befor putting the new ones in 
  document.querySelector('#emails-view').innerHTML = '';

  // Shows the emails view and hides comose and big email
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
      <button class = 'archive-button'>Archive</button>
  `;
      // Fill in the email div 
      email_div.innerHTML = emailContent;

      // `On click event that allows you to open the big view of the email 
      email_div.addEventListener('click', () => {
        load_email(email.id);
      });

      // Add the email to the emails-view
      document.querySelector('#emails-view').appendChild(email_div);
      email_div.querySelector(".archive-button").addEventListener("click", (event)=>{
        event.stopPropagation(); 
        set_archived(email.id)
        email_div.style.display = 'none' // this can definitly be done in a better way 
      })
    }

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // TODO: add an if statment that if the mailbox is archived this sets the value of the archived button to un archive or something
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
    document.querySelector('#big-email').dataset.emailId = email.id; // Allows me to refrence what email I am reading easily
    mark_as_read(email.id)
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
    sender.innerHTML = `Sent by: ${email.sender}<br>`;
    timestamp.innerHTML = `${email.timestamp}<hr>`;

    container.appendChild(subject);
    container.appendChild(sender);
    container.appendChild(timestamp);
    container.appendChild(email_text);

    };

function mark_as_read(email_id){
  // marks the email you have written as read 
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  }).catch(error=>{
    console.log(`Error: ${error}`);
  }) 
}

function set_archived(email_id) {
  // Fetch the current state of the email
  fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(email => {
      // Toggle the archived status
      const newArchivedStatus = !email.archived;

      // Update the email with the new archived status
      fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: newArchivedStatus
        })
      }).catch(error => {
        console.log(`Error updating archived status: ${error}`);
      });
    })
    .catch(error => {
      console.log(`Error fetching email: ${error}`);
    });
}

// NOTE: this function currently doesn't work
// change this to not have the time in seconds 
//  change this to say x h ago or x days ago

// TODO the only thing left to do is to check this time stamp function 
    function format_date(timestamp){
         
      const date = new Date();
      const time = new Date(timestamp)
      if (date.getDate() === time.getDate()){

        // const minutesPassed = date.getMinutes - time.minutesPassed
        const hoursPassed = date.getHours() - time.getHours();

        // Return the number of hours passed
        return `${hoursPassed} hours ago`;
      } else if (date.getDate() - time.getDate() === 1) {
        // If the timestamp is from yesterday
        return 'Yesterday';
      }else {
        return time.toLocaleDateString();
      }
}

function toTitleCase(text) {
  return text.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}