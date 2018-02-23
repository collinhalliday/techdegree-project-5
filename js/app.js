// $(document).ready(function() {

    //Declaring variables
    const body = document.getElementsByTagName('body')[0];
    const searchDiv = document.querySelector('.search-div');
    const randomEmployeeGeneratorAPI = 'https://randomuser.me/api/';
    const employeeGrid = document.getElementsByClassName('grid-container');
    let employeeData;
    let employeeDataPopulated = false;
    let modalWindow;
    let employeeIndex;
    const $searchField = $('#search');
    const $submitButton = $('#submit');
    let filteredSearchOn = false;
    let searchTerm;
    let filteredEmployees;

    //Randomly generating 12 employees through random generation API
    const generatorOptions = {
      url: randomEmployeeGeneratorAPI,
      dataType: 'json',
      results: '12',
      inc: 'name, location, email, picture, dob, cell, login, nat',
    }

    $.getJSON(randomEmployeeGeneratorAPI, generatorOptions, displayEmployees);

    //Displays employees by creating and appending grid items.
    function displayEmployees(data) {
      if(data.error) {
        let errorMessage = '<p>' + data.error + '</p>';
        $('.grid-container').html(errorMessage);
      } else {
          let gridHTML = '';
          if(!employeeDataPopulated) {
            employeeData = data.results;
            employeeDataPopulated = true;
          }
          $.each(data.results, function(index, employee) {
            gridHTML += '<div class="grid-item">';
            gridHTML += '<div class="image" style="background-image: url(' + employee.picture.large + ')"></div>';
            gridHTML += '<div class="text">';
            gridHTML += '<p class="name">' + employee.name.first + ' ' + employee.name.last + '</p>';
            gridHTML += '<p class="email">' + employee.email + '</p>';
            gridHTML += '<p class="city">' + employee.location.city + '</p>';
            gridHTML += '</div></div>';
          }); // end each

          $('.grid-container').html(gridHTML);
      }
    }

    //Event Listener: Calls createModalWindow upon click on particular employee div, and append to page.
    $(employeeGrid).on('click', function(event) {
      modalWindow = document.querySelector('#myModal');
      let inGridItem = false;
      const gridItems = document.getElementsByClassName('grid-item');
      $.each(gridItems, function (index, gridItem) {
        if($.contains(gridItem, event.target))
          inGridItem = true;
      });
      if($(event.target).hasClass('grid-item') || inGridItem) {
        $(modalWindow).remove();
        modalHTML = createModalWindow(event.target);
        body.appendChild(modalHTML);
      }
    });

    //Creates employee modal window when called based on which employee div is clicked.
    function createModalWindow(employeeItem) {
      let employeeInfo;
      if(toString.call(employeeItem) !== "[object Object]")
        employeeInfo = getEmployeeInfo(employeeItem);
      else
        employeeInfo = employeeItem;
      let element = document.createElement('div');
      element.className = 'modal';
      element.id = 'myModal';
      let html = '<div class="modal-content">';
           html += '<span class="close">&times;</span>';
           html += '<div class="modal-image"><img src="' +
                   employeeInfo.picture.large +
                   '"/></div>';
           html += '<div class="modal-text">';
           html += '<p class="modal-name">' + employeeInfo.name.first + ' ' + employeeInfo.name.last + '</p>';
           html += '<p class="modal-username">' + employeeInfo.login.username + '</p>';
           html += '<p class="modal-email">' + employeeInfo.email + '</p>';
           html += '<p class="modal-city">' + employeeInfo.location.city + '</p>';
           html += '</div>'
           html += '<div class="additional-text">';
           html += '<p class="modal-cell">' + employeeInfo.cell + '</p>';
           html += '<p class="modal-address">' +
                   employeeInfo.location.street + ', ' +
                   employeeInfo.location.city + ', ' +
                   employeeInfo.location.state + ' ' +
                   employeeInfo.location.postcode + ', ' +
                   employeeInfo.nat + '</p>';
           html += '<p class="modal-birthday">Birthday: ' + formatDate(employeeInfo.dob) + '</p>';
           html += '<span class="next">&#8250;</span>';
           html += '<span class="previous">&#8249;</span>';
           html += '</div>'
           html += '</div>';
      element.innerHTML = html;

      $(element).on('click', function(event) {
        modalWindow = $('#myModal');
        if(event.target.className === 'next' ||
           event.target.className === 'previous' ||
           event.target.className === 'close')
            $(modalWindow).remove();
        if(event.target.className === 'next' ||
           event.target.className === 'previous') {
             if(filteredSearchOn) {
               if(event.target.className === 'next') {
                 if(employeeIndex === filteredEmployees.results.length - 1)
                   employeeIndex = 0;
                 else
                   employeeIndex++;
               } else if (event.target.className === 'previous') {
                   if(employeeIndex === 0)
                     employeeIndex = filteredEmployees.results.length - 1;
                   else
                     employeeIndex--;
               }
               modalHTML = createModalWindow(filteredEmployees.results[employeeIndex]);
             } else {
                 if(event.target.className === 'next') {
                   if(employeeIndex === employeeData.length - 1)
                     employeeIndex = 0;
                   else
                     employeeIndex++;
                 } else if (event.target.className === 'previous') {
                     if(employeeIndex === 0)
                       employeeIndex = employeeData.length - 1;
                     else
                       employeeIndex--;
                 }
                  modalHTML = createModalWindow(employeeData[employeeIndex]);
                }
            body.appendChild(modalHTML);
        }
      });
      return element;
    }

    function formatDate(date) {
      let numbers = date.match(/\d+/g);
      let fullYear = numbers[0];
      let month = numbers[1];
      let day = numbers[2];
      let abbrYear = fullYear.replace(/\d{2}/, '');
      return month + "/" + day + "/" + abbrYear;
    }

    //Finds specific employee in employeeData by using info from employee clicked.
    function getEmployeeInfo(eventTarget) {
      let employeePicutreURL;
      let gridItem;
      if(eventTarget.className === 'grid-item')
        gridItem = eventTarget;
      else if(eventTarget.className === 'image' ||
              eventTarget.tagName === "DIV")
        gridItem = eventTarget.parentNode;
      else
        gridItem = eventTarget.parentNode.parentNode;
      employeePicutreURL = gridItem.children[0].style.backgroundImage.replace('url("', '').replace('")', '');
      if(filteredSearchOn) {
          for(let i = 0; i < filteredEmployees.results.length; i++) {
            if(filteredEmployees.results[i].picture.large === employeePicutreURL)
              employeeIndex = i;
          }
          return filteredEmployees.results[employeeIndex];
      } else {
          for(let i = 0; i < employeeData.length; i++) {
            if(employeeData[i].picture.large === employeePicutreURL)
              employeeIndex = i;
          }
          return employeeData[employeeIndex];
      }
    }

    //Event Listener: Employee search code
    $('.search-form').submit(function (event) {
      $('.modal').remove();
      $('.search-message').remove();
      searchTerm = $searchField.val();
      event.preventDefault();
      if(searchTerm === ''){
        createSearchItem('<p>Please enter a valid search term.</p>');
      } else {
          $searchField.prop("disabled", true);
          $submitButton.attr("disabled", true).val("Searching...");
          employeeSearch(employeeData);
      }
    }); // end click

    function employeeSearch(data) {
          filteredSearchOn = true;
          filteredEmployees = {results: []};
          $.each(data, function(index, value) {
            let name = value.name.first + ' ' + value.name.last;
            if(name.includes(searchTerm.toLowerCase()) ||
               value.login.username.includes(searchTerm.toLowerCase())) {
                 filteredEmployees.results.push(value);
            }
          });
          displayEmployees(filteredEmployees);
          $searchField.prop("disabled", false);
          $submitButton.attr("disabled", false).val("Search");
          if (filteredEmployees.results.length === 0) {
            createSearchItem('<p>Sorry, there are no employees that match the search term: ' + '"' + searchTerm + '"</p>');
          } else {
             createSearchItem('<p>Your search for "' + searchTerm + '" produced ' +
             filteredEmployees.results.length + ' results.</p>');
          }
          let exitButton = document.createElement('button');
          exitButton.type = 'button';
          exitButton.className = 'exit-search';
          exitButton.textContent = 'Exit Search';
          $('.exit-search').remove();
          $('form').after(exitButton);
          $('.exit-search').on('click', function() {
            $('.modal').remove();
            $('.exit-search').remove();
            $('.search-message').remove();
            filteredSearchOn = false;
            displayEmployees({results: employeeData});
          });
    }

    function createSearchItem(item) {
      let messageDiv = document.createElement('div');
      $(messageDiv).html(item);
      messageDiv.className = 'search-message';
      searchDiv.appendChild(messageDiv);
    }

// }); // end ready
