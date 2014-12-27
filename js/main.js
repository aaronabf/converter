$(document).ready(function(){
  $("#input").keyup(update);
  $("#type").change(update);
  $("#signed").change(update);

  function update() {
    var value = $("#input").val();
    var signed = $("#signed").val() === 'signed';
    var type = detect(value, signed);

    if (value === '') {
      setAllText('','','');
    } else if (type !== 'invalid') {
      if (type === 'signed') {
        $("#type").val('decimal');
        $("#signed").val('signed');
      } else {
        $("#type").val(type);
      }

      setAllText(convertToBinary(value, type),
                 convertToDecimal(value, type),
                 convertToHexidecimal(value, type));
    } else {
      setAllText('Invalid input.', 'Invalid input.', 'Invalid input.');
    }
  }

  function detect(input) {
    var bin = true;
    var hex = true;
    var dec = true;
    var signed = false;

    for (var i = 0; i < input.length; i++) {
      var x = input[i];
      if ((x >= 'A' && x <= 'F') || (x >= 'a' && x <= 'f')) {
        bin = dec = false;
      } else if (x === '0' || x === '1') {
        // Anything can have a '0' or '1'
      } else if (x >= '2' && x <= '9') {
        bin = false;
        hex = true;
      } else if (x === 'x') {
        // Check for '0x' in the beginning of a hex number
        if (i === 1 && input[0] === '0' && input.length !== 2) {
          bin = dec = false;
        } else {
          bin = hex = dec = false;
          break;
        }
      } else if (x === '-') {
        // Check for '-' in the beginning of a decimal number
        if (i === 0 && input.length !== 1) {
          signed = true;
        }

        bin = hex = dec = false;
        break;
      } else {
        bin = hex = dec = false;
        break;
      }
    }

    // If contains '-' then must be a signed decimal
    if (signed) {
      return 'signed'
    // If only 1s and 0s then detect as binary
    } else if (bin) {
      return 'binary';
    // If only digits then detect as decimal
    } else if (dec) {
      return 'decimal';
    // If digits, a 0x, and/or letters A-F then detect as hex
    } else if (hex) {
      return 'hexidecimal';
    // Otherwise the input is invalid
    } else {
      return 'invalid';
    }
  }

  function setAllText(binText, decText, hexText) {
    $("#binary").html(binText);
    $("#decimal").html(decText);
    $("#hexidecimal").html(hexText);
  }

  // Converts input 'input' of type 'type' to binary
  function convertToBinary(input, type) {
    input = input.replace('-', '');

    switch (type) {
      case 'binary':
        return input;
      case 'decimal':
        return parseInt(input, 10).toString(2);
      case 'hexidecimal':
        return parseInt(input, 16).toString(2);
    }
  }

  // Converts input 'input' of type 'type' to hexidecimal
  function convertToHexidecimal(input, type) {
    input = input.replace('-', '');

    switch (type) {
      case 'binary':
        return parseInt(input, 2).toString(16);
      case 'decimal':
        return parseInt(input, 10).toString(16);
      case 'hexidecimal':
        return input;
    }
  }

  // Converts input 'input' of type 'type' to decimal
  function convertToDecimal(input, type) {
    switch (type) {
      case 'binary':
        return parseInt(input, 2).toString(10);
      case 'decimal':
        return input;
      case 'hexidecimal':
        return parseInt(input, 16).toString(10);
    }
  }
});
