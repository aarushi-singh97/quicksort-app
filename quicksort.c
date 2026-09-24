/* Quick Sort using Hoare partition scheme */
#include <stdio.h>

void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int partition(int arr[], int low, int high) {
    int pivot = arr[low];
    int i = low - 1;
    int j = high + 1;

    while (1) {
        do { i++; } while (arr[i] < pivot);
        do { j--; } while (arr[j] > pivot);
        if (i >= j) return j;
        swap(&arr[i], &arr[j]);
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
    int arr[] = {8, 2, 5, 9, 1, 6, 3};
    int n = sizeof(arr) / sizeof(arr[0]);
    int i;

    quicksort(arr, 0, n - 1);
    printf("Sorted array: ");
    for (i = 0; i < n; i++) printf("%d ", arr[i]);
    return 0;
}
