/**
 * Returns a negative value if a has lower priority than b,
 * a positive value if a has greater priority than b, and 0 if a = b.
 */
export type Comparator<E> = (a: E, b: E) => number;

/**
 * Maintains a list of values, providing the ability to efficiently retrieve
 * (and remove) the highest priority value from the list (in O(log n) time).
 */
export interface PriorityQueue<Elem> {
  /**
   * Determines if the list is empty.
   * @returns true if the list is empty, false otherwise
   */
  isEmpty: () => boolean;

  /**
   * Returns a reference to the highest priority element in the list. Note:
   * 1. The list must not be empty.
   * 2. The behavior is undefined if that element is later mutated in any way
   *    that affects the behavior of comparison with other elements in the list.
   * @returns the minimum element in the list
   */
  first: () => Elem;

  /**
   * Adds the given element to the list. Note that the behavior is undefined if
   * the element is mutated in any way that changes the behavior of comparisons.
   * @param e element to add
   */
  add: (e: Elem) => void;

  /**
   * Removes and returns the highest priority element. List must not be empty!
   * @returns the highest priority element
   */
  removeFirst: () => Elem;
}

/**
 * Maintains a list of values, providing the ability to efficiently retrieve
 * (and remove) the highest priority value from the list (in O(log n) time).
 */
class QuickPriorityQueue<Elem> implements PriorityQueue<Elem> {
  elems: Array<Elem>;
  cmp: Comparator<Elem>;

  /**
   * Creates an empty list. The given comparator will be used to compare
   * elements in the list, which is needed to find the highest priority value.
   */
  constructor(cmp: Comparator<Elem>) {
    this.elems = [];
    this.cmp = cmp;
  }

  isEmpty = (): boolean => {
    return this.elems.length === 0;
  }

  first = (): Elem => {
    if (this.isEmpty())
      throw new Error("the list is empty -- there is no first element")

    return this.elems[0];
  }

  add = (e: Elem): void => {
    this.elems.push(e);
    this.moveUp_(this.elems.length - 1);
  }

  removeFirst = (): Elem => {
    if (this.isEmpty())
      throw new Error("the list is empty -- there is no first element")

    const m = this.elems[0];
    this.elems[0] = this.elems[this.elems.length - 1];
    this.elems.pop();
    if (!this.isEmpty())
      this.moveDown_(0);
    return  m;
  }

  /**
   * Moves the element at the given index down the tree until it has equal or
   * higher priority than both of its children.
   */
  moveDown_ = (index: number): void => {
    if (index < 0 || this.elems.length <= index)
      throw new Error(`invalid index: ${index} of ${this.elems.length} elements`);

    const childIndex1 = 2 * index;
    const childIndex2 = 2 * index + 1;
    if (childIndex1 >= this.elems.length) {
      // This implies that Child 2 also does not exist, so the new element is a
      // leaf, which is a valid position.
    } else if (this.cmp(this.elems[index], this.elems[childIndex1]) >= 0) {
      // New element has higher priority than child 1.
      if (childIndex2 >= this.elems.length ||
          this.cmp(this.elems[index], this.elems[childIndex2]) >= 0) {
        // New element has higher priority than both children, so it is a valid
        // parent for both of them.
      } else {
        // Child 2 has higher priority than new element but child 1 has lower.
        // This implies (transitivity) that child 2 has higher priority than
        // child 1 and, hence, is a valid parent of both of them.
        this.swap_(index, childIndex2);
        this.moveDown_(childIndex2);  // check new element's new children
      }
    } else {
      // Child 1 has higher priority than the new element.
      if (childIndex2 >= this.elems.length ||
          this.cmp(this.elems[childIndex1], this.elems[childIndex2]) >= 0) {
        // Child 1 has higher priority than both the new element and child 2.
        // This shows that child 1 is a valid parent of both of them.
        this.swap_(index, childIndex1);
        this.moveDown_(childIndex1);  // check new element's new children
      } else {
        // Child 2 has higher priority than child 1 and the new element. This
        // implies that child 2 has higher priority than the new element and,
        // hence, is a valid parent of both of them.
        this.swap_(index, childIndex2);
        this.moveDown_(childIndex2);  // check new element's new children
      }
    }
  }

  /** Swaps the elements at the two given indexes. */
  swap_ = (index1: number, index2: number): void => {
    if (index1 < 0 || this.elems.length <= index1)
      throw new Error(`invalid index 1: ${index1} of ${this.elems.length} elements`);
    if (index2 < 0 || this.elems.length <= index2)
      throw new Error(`invalid index 2: ${index2} of ${this.elems.length} elements`);

    const t = this.elems[index1];
    this.elems[index1] = this.elems[index2];
    this.elems[index2] = t;
  }

  /**
   * Moves the element at the given index up the tree until it is has equal
   * or higher priority than both of its children.
   */
  moveUp_ = (index: number): void => {
    if (index < 0 || this.elems.length <= index)
      throw new Error(`invalid index: ${index} of ${this.elems.length} elements`);

    if (index == 0) {
      // New element has no parent, so there is no parent condition to satisfy.
    } else {
      const parentIndex = Math.floor(index / 2);
      if (this.cmp(this.elems[index], this.elems[parentIndex]) >= 0) {
          // New element is smaller than the parent. This implies (by
          // transitivity) that it is also larger than the parent's other child,
          // so it is valid parent for both of them.
          this.swap_(index, parentIndex);
          this.moveUp_(parentIndex);  // check new element's new parent
      } else {
        // Parent is smaller than the new element, so it is a valid parent.
      }
    }
  };
}

/**
 * Creates a new PriorityQueue where elements are sorted with given comparator
 * @param cmp to sort elements by
 * @returns new PriorityQueue object
 */
export const newPriorityQueue = <Elem>(cmp: Comparator<Elem>): PriorityQueue<Elem> => {
  return new QuickPriorityQueue(cmp);
}