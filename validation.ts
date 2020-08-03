type TSource = { [key: string]: any }
type TResult = string|boolean
type TValue = string|number|boolean
type TValidator = (source: TSource) => TResult
type TModifyCreator = (argument: string | TValidator, error?: TResult) => TValidator
type TCompareCreator = (argument: string, value: TValue, error?: TResult) => TValidator
type TSelectCreator = (argument: TValidator[], error?: TResult) => TValidator

const is: TModifyCreator = (argument, error = false) => (source) => {
	switch(typeof argument) {
		case 'function': {
			return !!argument(source) ? true : error
		}
		case 'string':
		case 'number': {
			return !!source[argument] ? true : error
		}
		default: {
			return error
		}
	}
}

const gt: TCompareCreator = (argument, value, error = false) => (source) => {
	return source[argument] > value
		? true
		: error
}

const lt: TCompareCreator = (argument, value, error = false) => (source) => {
	return source[argument] < value
		? true
		: error
}

const all: TSelectCreator = (argument = [], error = false) => (source) => {
	const callback = argument.find(cb => {
		return cb(source) !== true
	})
	const result = callback ? callback(source) : true
	switch (typeof result) {
		case 'string':
		case 'boolean': {
			return result
		}
		default: {
			return error
		}
	}
}

const any: TSelectCreator = (argument = [], error = false) => (source) => {
	const tests = argument
		.map(cb => cb(source))
	const success = tests
		.find(res => res === true)
	const failure = tests
		.find(res => res !== true)
	const result = success
		? true
		: failure || error

	return result
}

const validator = (source: TSource, rule: TValidator, field?: string) => (value: TValue): TResult => {
	return typeof field !== 'undefined'
		? rule({ ...source, [field]: value })
		: rule({ ...source })
}

const source = {
	no_limit: true,
	time_limit: 1200,
}

const test = any([
	all([
		gt('time_limit', 0, 'too low'),
		lt('time_limit', 200, 'too high'),
	]),
	is('no_limit', 'not limited'),
])

const time_validator = validator(source, test, 'time_limit')

console.log(time_validator(300))

source.no_limit = false

console.log(time_validator(1500))
console.log(time_validator(150))