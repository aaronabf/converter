$(document).ready(function(){
  // Runs update for each input change.
  $("#input").keyup(update);
  $("#type").change(update);
  $("#signed").change(update);

  // Auto-selects correct type and sets the text for each type.
  function update() {
    var value = $("#input").val();
    var type = $("#type").val();
    var detectedType = detectType(value);
    var signed = isSigned(value);

    // Check if the auto select is turned on.
    if (type === 'auto') {
      type = detectedType;
    }

    // If there is a '-' then we set selection to signed.
    if (signed) {
      $("#signed").html('(signed)');
    } else {
      $("#signed").html('(unsigned)');
    }

    // Changes the text color to designate the type selected.
    changeTextColors(type);

    // Determines if the input is valid and converts/sets the text.
    if (value === '') {
      setAllText('','','');
    } else if (detectedType === 'invalid' ||
               !isSubType(type, detectedType) ||
               signed && type !== 'decimal') {
      setAllText('Invalid input.', 'Invalid input.', 'Invalid input.');
    } else {
      if (signed) {
        type = 'signedDec';
      }
      setAllText(convertToBinary(value, type),
                 convertToDecimal(value, type),
                 convertToHexidecimal(value, type));
    }
  }

  // Detects the type of the input.
  function detectType(input) {
    var bin = true;
    var hex = true;
    var dec = true;
    var signedError = false;

    // Loop through each character
    for (var i = 0; i < input.length; i++) {
      var x = input[i];
      if ((x >= 'A' && x <= 'F') || (x >= 'a' && x <= 'f')) {
        bin = dec = false;
      } else if (x === '0' || x === '1') {
        // Anything can have a '0' or '1'.
      } else if (x >= '2' && x <= '9') {
        bin = false;
        hex = true;
      } else if (x === 'x') {
        // Check for '0x' in the beginning of a hex number.
        if (i === 1 && input[0] === '0' && input.length !== 2) {
          bin = dec = false;
        } else {
          bin = hex = dec = false;
          break;
        }
      } else if (x === '-') {
        // Check for '-' in the beginning of a decimal number.
        if (i !== 0 || input.length === 1) {
          signedError = true;
        }

        bin = hex = false;
      } else {
        bin = hex = dec = false;
        break;
      }
    }

    // If a '-' is not at the beginning then there is an error.
    if (signedError) {
      return 'invalid'
    }
    // If only 1s and 0s then detect as binary.
    else if (bin) {
      return 'binary';
    }
    // If only digits then detect as decimal.
    else if (dec) {
      return 'decimal';
    }
    // If digits, a 0x, and/or letters A-F then detect as hexidecimal.
    else if (hex) {
      return 'hexidecimal';
    }
    // Otherwise the input is invalid.
    else {
      return 'invalid';
    }
  }

  // Detects if the input is signed.
  function isSigned(input) {
    return (input.length !== 0 && input[0] === '-');
  }

  // Sets the text for each type.
  function setAllText(binText, decText, hexText) {
    $("#binaryNum").html(binText);
    $("#decimalNum").html(decText);
    $("#hexidecimalNum").html(hexText);
  }

  // Sets text color as of the type to black and to default text color.
  function changeTextColors(type) {
    ['binary', 'decimal', 'hexidecimal'].forEach(function (t) {
      var color;

      if (t === type) {
        color = '#000';
      } else if (t === 'decimal' && type === 'signedDec') {
        color = '#000';
      }else {
        color = '#FAA';
      }

      $("#" + t).css('color', color);
    });
  }

  // Ensures that type is a "subtype" of the detectedType. For example, if we
  // detected the type is decimal, then the selected type cannot be binary.
  function isSubType(type, detectedType) {
    var bool = false;

    // No, there are no breaks missing below.
    switch (detectedType) {
      case 'binary':
        bool |= (type === 'binary');
      case 'decimal':
        bool |= (type === 'decimal');
      case 'hexidecimal':
        bool |= (type === 'hexidecimal');
      default:
        return bool;
    }
  }

  // Converts input 'input' of type 'type' to binary.
  function convertToBinary(input, type, signed) {
    var x = input.replace('-', '');

    switch (type) {
      case 'binary':
        return x;
      case 'decimal':
        return parseInt(x, 10).toString(2);
      case 'hexidecimal':
        return parseInt(x, 16).toString(2);
      case 'signedDec':
        return convertToTwos(x);
      default: // This should never be reached
        return '';
    }
  }

  // Converts input 'input' of type 'type' to hexidecimal.
  function convertToHexidecimal(input, type, signed) {
    var x = input.replace('-', '');

    switch (type) {
      case 'binary':
        return parseInt(x, 2).toString(16);
      case 'decimal':
        return parseInt(x, 10).toString(16);
      case 'hexidecimal':
        return x;
      case 'signedDec':
        return parseInt(convertToTwos(x), 2).toString(16);
      default: // This should never be reached.
        return '';
    }
  }

  // Converts input 'input' of type 'type' to decimal.
  function convertToDecimal(input, type, signed) {
    switch (type) {
      case 'binary':
        return parseInt(input, 2).toString(10);
      case 'decimal':
      case 'signedDec':
        return input;
      case 'hexidecimal':
        return parseInt(input, 16).toString(10);
      default: // This should never be reached.
        return '';
    }
  }

  // Convert to two's complement.
  function convertToTwos(num) {
    // Actually conversion.
    var converted = (-parseInt(num, 10) + 1).toString(2).replace('-', '')
      .replace(/[01]/g, function(c) { return +!+c; });

    // Adds padding for 32-bits.
    if (32 - converted.length + 1 < 0) {
      return '0';
    } else {
      return Array(32 - converted.length + 1).join(1) + converted;
    }
  }
});
