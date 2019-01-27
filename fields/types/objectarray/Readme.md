# Number Field

Stores a `Object Array` in the model.
Displayed as a Object Array field in the Admin UI.

## Example

```js
{
	type: Types.ObjectArray,
	required: true,
	initial: true,
	default: [],
	fields: {
		title: { type: Types.Text, required: false, initial: true },
		alt: { type: Types.Text, required: false, initial: true },
		url: { type: Types.Text, required: true, initial: true },
	}
}
```
