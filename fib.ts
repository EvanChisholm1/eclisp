function fibDp(n: number): bigint {
    if (n === 0) {
        return 0n;
    } else if (n === 1) {
        return 1n;
    }

    const dp = new Array(n + 1).fill(0);
    dp[0] = 0n;
    dp[1] = 1n;

    for (let i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }

    return dp[n];
}

function fib(n: number): number {
    if (n === 0) {
        return 0;
    } else if (n === 1) {
        return 1;
    } else {
        return fib(n - 1) + fib(n - 2);
    }
}

for (let i = 0; i <= 20; i++) {
    console.log(fib(i));
}
console.log(fibDp(100));
