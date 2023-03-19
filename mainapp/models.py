from django.db import models

class Location(models.Model):
	dateofadding = models.DateTimeField(auto_now_add = True)
	previewimg = models.FileField(null = True)
	title = models.CharField(max_length = 300, db_index = True)
	region = models.CharField(max_length = 50, null = True, blank = True)
	url = models.URLField(null = True, blank = True)
	info = models.TextField(null = True, blank = True)

	def __str__(self):
		return self.title
	

class Picture(models.Model):
	file = models.FileField()
	location = models.ForeignKey(Location, null=True, on_delete=models.CASCADE)

	def __str__(self):
		return self.file.name
