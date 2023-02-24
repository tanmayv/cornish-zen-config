const arguments = process.argv;
const input_file_name = arguments[2];

if (!input_file_name) {
  console.log("Pass file_name");
  process.exit(1);
}

const fs = require('fs');
let input_file = "";
let input_bindings = [];
fs.readFile(input_file_name, 'utf8', (err, data) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  input_file = data;
  ProcessAndWriteFile();
  process.exit(0);
})

function FormatLine(lines, cols_count) {
  const TokenType = {
    TOKEN_OP : "TOKEN_OP",
    TOKEN_PARAM : "TOKEN_PARAM"
  };


  function ToTokens(raw_layer) {
    const processed_stream = raw_layer.split(/\s/).filter(x => !!x);
    return processed_stream.map(raw => {
      if (raw.startsWith("&")) {
        return {
          token_type: TokenType.TOKEN_OP,
          token: raw
        };
      }
      return {
        token_type: TokenType.TOKEN_PARAM,
        token: raw
      };
    })

  }

  function ToKeysMappings(token_list) {
    let result = [];

    let current = "";
    for (let t of token_list) {
      const token = t.token;
      const token_type = t.token_type;
      if (token_type == TokenType.TOKEN_OP) {
        if (current != "") {
          result.push(current);
          current = "";
        }

        current += token;
      } else {
        current += " " + token;
      }

    }
    if (current != "") result.push(current.trim());
    // console.log("KEYMAPPINGS ", result);
    return result;
  }

  function pad(str, desired_len) {
    // const res = str + Array.from(Array(desired_len - str.length).keys()).map(x => " ").join("");
    // return res + "(" + res.length + ")"
    return str + Array.from(Array(desired_len - str.length).keys()).map(x => " ").join("");
  }

  function GetPaddedMappings(mappings) {
    const output = "";
    const total = cols_count.reduce((total, x) => total + x, 0);
    if (total != mappings.length) {
      // console.log("Expected mappings to be ", total, " bot got ", mappings.length);
      return;
    }

    const max_col = cols_count.reduce((max, x) => Math.max(max, x), 0);

    let padded_mappings = [];
    let index = 0;
    let left = true;
    for (const count of cols_count) {
      const to_be_added = mappings.slice(index, index + count);
      if (count < max_col) {
        const extras = max_col - count;
        const padding = Array.from(Array(extras).keys()).map(x => ""); 
        if (left) {
          padded_mappings =[...padded_mappings, [...padding, ...to_be_added]];
        } else {
          padded_mappings =[...padded_mappings, [...to_be_added, ...padding]];
        }
      }
      else {
        padded_mappings = [...padded_mappings, to_be_added]
      }
      index += count;
      left = !left;
    }
    // console.log(padded_mappings);
    return padded_mappings; 
  }

  function UniformMapping(padded_mappings) {
    // console.log(padded_mappings);
    const row_limit = padded_mappings.length;
    const process = (row, col, current_max) => {
      // console.log("I am " + row + "," + col + " Started with ", current_max);
      // if (row == 0) 
      //   console.log("Start ROW");
      // console.log(row, col);
      // if (row >= row_limit)
      //   console.log("End Row")
      // else 
      // return process(row + 2, col)
      // const current = padded_mappings[row];
      if (row >= row_limit) return current_max;
      const new_max = Math.max(current_max, padded_mappings[row][col].length);
      // console.log("Called Down with ", new_max);
      const final_max = process(row + 2, col, new_max);
      // console.log("Finally Got ", final_max);
      padded_mappings[row][col] = pad(padded_mappings[row][col], final_max);
      return final_max;
    }
    // process(0,0, 0);
    for (let col = 0; col < padded_mappings[0].length; col++) {
      process(0, col, 0);
      process(1, col, 0);
      // console.log("Col_max for col ", col, " is ", col_max);
    }
    let paired_mapping = [];
    for (let i = 0; i < padded_mappings.length; i += 2) {
      paired_mapping.push(padded_mappings[i].join(" ") + "        " + padded_mappings[i + 1].join(" "));
    }
    // console.log("Uniform ", paired_mapping);
    return paired_mapping; 
  }
const mappings = ToKeysMappings(ToTokens(lines.join("\n")));
// console.log(mappings);
  const padded_mappings = GetPaddedMappings(mappings);
  return UniformMapping(padded_mappings);
}

const config_regex = /@format\((.*)\)@lines\((.*)\)/;
function ProcessAndWriteFile() {
  const split_input_file = input_file.split("\n");
  let split_output_file  = [];
  for (let current_line = 0; current_line < split_input_file.length;) {
    const config = split_input_file[current_line].match(config_regex);
    split_output_file.push(split_input_file[current_line++]);     
    if (!config) {
      continue;
    }
    const cols_count = config[1].split(",").map(s => +s);
    const input_lines = split_input_file.slice(current_line, current_line + (+config[2]));
    const altered_lines = FormatLine(input_lines, cols_count);
    for (const l of altered_lines) {
      split_output_file.push(l);
      current_line++;
    }
  }
const content = split_output_file.join("\n");
  console.log();
  fs.writeFileSync(input_file_name, content);

}

// const mappings = ToKeysMappings(ToTokens(test_string));
// // console.log(mappings);
// const padded_mappings = GetPaddedMappings(mappings);
// console.log(UniformMapping(padded_mappings))
// console.log(pad("tan", 5) + "!")
