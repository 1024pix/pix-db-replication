import js from "@eslint/js";
import stylisticJs from "@stylistic/eslint-plugin-js";
import eslintPluginYml from 'eslint-plugin-yml';
import mochaPlugin from "eslint-plugin-mocha";
import nodePlugin from "eslint-plugin-n";

export default [
  {
    ignores: ["eslint.config.js", "!/.circleci"]
  },
  js.configs.recommended,
  {
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "_" }],
      "no-restricted-syntax": ["error",
        {
          selector: "NewExpression[callee.name=Date][arguments.length=1][arguments.0.type=Literal]:not([arguments.0.value=/^[12][0-9]{3}-(0[0-9]|1[0-2])-([0-2][0-9]|3[01])(T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]Z)?$/])",
          message: "Use only ISO8601 UTC syntax ('2019-03-12T01:02:03Z') in Date constructor"
        },
        {
          selector: "CallExpression[callee.object.object.name='faker'][callee.object.property.name='internet'][callee.property.name='email']",
          message: "Use only faker.internet.exampleEmail()"
        }
      ],
      "no-var": ["error"],
      "prefer-const": ["error"],
      "no-undef": ["off"],
      "no-console": ["error"]
    }
  },
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module"
    }
  },
  ...eslintPluginYml.configs["flat/recommended"],
  mochaPlugin.configs.flat.recommended,
  {
    rules: {
      "mocha/no-exclusive-tests": ["error"],
      "mocha/no-identical-title": ["error"],
      "mocha/no-skipped-tests": ["error"],
    }
  },
  nodePlugin.configs["flat/recommended"],
  {
    rules: {
      "n/no-process-env": ["error"],
      "n/no-unpublished-import": ["error",
        {
          allowModules: [
            "chai",
            "chai-as-promised",
            "mocha",
            "nock",
            "pg-connection-string",
            "sinon",
            "sinon-chai",
            "tmp-promise"
          ]
        }
      ]
    }
  },
  {
    plugins: {
      "@stylistic/js": stylisticJs
    },
    rules: {
      "@stylistic/js/arrow-parens": ["error", "always"],
      "@stylistic/js/comma-dangle": ["error", "always-multiline"],
      "@stylistic/js/computed-property-spacing": ["error", "never"],
      "@stylistic/js/eol-last": ["error"],
      "@stylistic/js/indent": ["error", 2, { SwitchCase: 1 }],
      "@stylistic/js/keyword-spacing": ["error"],
      "@stylistic/js/linebreak-style": ["error", "unix"],
      "@stylistic/js/no-multiple-empty-lines": ["error", { max: 1, maxEOF: 1 }],
      "@stylistic/js/object-curly-spacing": ["error", "always"],
      "@stylistic/js/quotes": ["error", "single"],
      "@stylistic/js/semi": ["error", "always"],
      "@stylistic/js/space-before-blocks": ["error"],
      "@stylistic/js/space-before-function-paren": ["error", { anonymous: "never", named: "never", asyncArrow: "ignore" }],
      "@stylistic/js/space-in-parens": ["error"],
      "@stylistic/js/space-infix-ops": ["error"],
      "@stylistic/js/func-call-spacing": ["error"],
      "@stylistic/js/key-spacing": ["error"],
      "@stylistic/js/comma-spacing": ["error"],
      "@stylistic/js/no-trailing-spaces": ["error"],
      "@stylistic/js/no-multi-spaces": ["error"]
    }
  }
]
