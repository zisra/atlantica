export default (argument) => {
	return {}.toString.call(argument).split(' ')[1].slice(0, -1).toLowerCase();
};
