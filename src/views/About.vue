<template>
	<div class="about">
		<h1>这是about组件</h1>
	</div>
</template>

<script>
export default {
	beforeCreate() {
		console.log("this.$router", this.$router);
	},
	created() {
		console.log("this.$router", this.$router);
	},
};
</script>
