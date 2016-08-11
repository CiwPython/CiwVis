A = [[2.1, 5], [2.6, 4], [3.1, 3], [3.8, 2], [6.3, 3], [6.6, 2], [7.0, 1], [7.3, 2], [8.9, 3], [9.5, 2]]
Weeks = [0, 3, 6, 9, 12]

lower = 4.0
higher = 5.0


def area(l, h, x1, x2, y1, y2):
	if l < x1 and x1 < h and h <= x2:
		return (h-x1)*y1
	elif l < x1 and h > x2:
		return (x2-x1)*y1
	elif x1 <= l and l < x2 and x1 < h and h <= x2:
		return (h-l)*y1
	elif x1 <= l and l <= x2 and h > x2:
		return (x2-l)*y1
	return 0.0

ses = []
for w in range(len(Weeks)-1):
	s = 0
	for i in range(len(A)-1):
		s += area(Weeks[w], Weeks[w+1], A[i][0], A[i+1][0], A[i][1], A[i+1][1])
	ses.append(s)


print(ses)
print(sum(ses))

total = 0
for i in range(len(A)-1):
	total += (A[i+1][0]-A[i][0])*A[i][1]

print(total)
