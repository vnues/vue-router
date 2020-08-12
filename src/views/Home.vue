<template>
	<div class="home">
		<h1>这是Home组件</h1>
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
