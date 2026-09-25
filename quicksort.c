/* Quick Sort using Hoare partition scheme */
#include <stdio.h>

#define MAX_SIZE 20

void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int partition(int arr[], int low, int high) {
    int pivot = arr[low];
    int i = low - 1;
    int j = high + 1;

    printf("\nPartitioning indexes %d to %d, pivot = %d\n", low, high, pivot);
    while (1) {
        do { i++; } while (arr[i] < pivot);
        do { j--; } while (arr[j] > pivot);
        printf("i = %d, j = %d\n", i, j);
        if (i >= j) {
            printf("Pointers crossed. Split index = %d\n", j);
            return j;
        }
        swap(&arr[i], &arr[j]);
        printf("Swapped %d and %d: ", arr[j], arr[i]);
        for (int k = 0; k <= high; k++) printf("%d ", arr[k]);
        printf("\n");
    }
}

void quicksort(int arr[], int low, int high) {
    if (low < high) {
        int split = partition(arr, low, high);
        quicksort(arr, low, split);
        quicksort(arr, split + 1, high);
    }
}

int main(void) {
    int arr[MAX_SIZE];
    int n;
    int i;

    printf("Quick Sort using Hoare Partition\n");
    printf("How many numbers (2-%d)? ", MAX_SIZE);
    if (scanf("%d", &n) != 1 || n < 2 || n > MAX_SIZE) {
        printf("Please enter a valid size.\n");
        return 1;
    }

    printf("Enter %d integers: ", n);
    for (i = 0; i < n; i++) {
        if (scanf("%d", &arr[i]) != 1) {
            printf("Invalid input.\n");
            return 1;
        }
    }

    quicksort(arr, 0, n - 1);
    printf("\nSorted array: ");
    for (i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\n");
    return 0;
}
