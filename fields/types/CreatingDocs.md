## Creating new Field Types for KeystoneJS

We're currently working on making it easier to add new field types to KeystoneJS as plugins.

In the meantime, if you'd like to work on your own field type, hopefully this guide will point you in the right direction.

Keystone fields require the following:

* a `{fieldType}.js` file in `./lib/fieldTypes` that controls the field and encapsulates options support, underscore functions, validation and updating
* the `{fieldType}.js` file needs to be included by `./lib/fieldTypes.js`
* a Field.js that creates a React class (e.g. `./fields/types/example/ExampleField.js`)
 * And may use the base Field (`./fields/types/Field.js`).
* the `{fieldField}.js` file needs to be included by `./admin/src/fields.js`
* **NOTE:** the association of which React Field class is instantiated is implicit based on the name of the `{fieldType}` class. This name is the only connection between your `Type` file and which React `Field` will be used in the admin.
 * Example: if the object exported by your `{fieldType}.js` is named `code` (e.g. `exports = module.exports = code`  where `code` is an existing Field in `./admin/src/fields.js`) then your `myCodeField.js` won't be instantiated, instead the React Field for `code` will (`./fields/types/code/CodeField.js`).
* [possibly outdated] if the field should be available when creating new items (not all types are) then it'll also need an `initial.jade` template in `./templates/fields/{fieldType}` that renders the form field for the create form
* unless it's a text-type field with no special formatting for the list view, also add support for it in `./templates/mixins/columns.jade`
 

If the field type requires an async callback to handle updates, e.g. file upload, support should be added to the `process` method in `./lib/updateHandler.js`.

To implement filtering on the field type in the list view, you'll need to add

* support for it in the `processFilters` and `getSearchFilters` methods in `./lib/list.js`
* a template to render the search interface in `./templates/views/list.jade` (around line 170 or so) - this should be broken up into `search.jade` templates with the `form.jade`, `initial.jade` ones but it hasn't happened yet!
 
Finally, some field types add their own client-side javascript or css that needs to be included in `./templates/layout/base.jade`. Specific styles for different field types are generally implemented in `./public/styles/keystone/forms.less`.

The base field class implements a few built-in options and methods that can be set / overridden by each FieldType class. At the moment, it's strongly recommended you understand how `./lib/field.js` (the base class) works, and review some of the ways different field types (in `./lib/fieldTypes`) are set up to get a feel for how this works.

#### Some hints:

In the constructor function you can set options that control how the base Field class sets up field types. These include:

* `this._nativeType` - unless you're providing your own `addToSchema` method, this is the data type that will be added to the mongoose Schema
* `this._underscoreMethods` (**Array** of **String**s) - a list of methods on the FieldType class that should be automatically bound as underscore methods to the field
  * methods bound as underscore methods should take `item` as their first argument. See the `crop` mthod in `./lib/fieldTypes/text.js` for an example.
* `options.nofilter` stops the field from being included in the drop-down list of available filters on the list view. Set this if you haven't implemented filtering as described above.
* `options.nosort` stops the field from being used to sort in the list view

If you are implementing a complex field type (by which we mean one that stores a complex value, e.g. the `markdown` field type, or one that implements middleware / virtuals / etc.) you need to override the `addToSchema` method. Follow an existing example closely, this method needs to `add()` to `this.schema`, and should call `this.bindUnderscoreMethods()`.

`validateInput` and `updateItem` should almost always be added, again see existing examples.

Please feel free to reach out to [@keystonejs](https://twitter.com/keystonejs) on twitter, on our [Google Group](http://groups.google.com/forum/#!forum/keystonejs) or comment on this gist if you've got any questions or get stuck!